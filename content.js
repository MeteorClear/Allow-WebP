//console.log("content.js load")


// Register event listeners
document.addEventListener('drop', (event) => {
    handleEvent(event, 'drop');
});
document.addEventListener('paste', (event) => {
    handleEvent(event, 'paste');
});


/**
 * Handle the occurred events.
 *
 * @param {Event} event - The event object.
 * @param {string} eventType - The type of the event ('drop' or 'paste').
 */
async function handleEvent(event, eventType) {
    console.log("event occurred :", eventType, event, event.type);

    if (eventType === 'paste' && !event.clipboardData) {
        console.error("Clipboard data is null or undefined.");
        return;
    }

    const items = (
            (eventType === 'drop') ? 
                event.dataTransfer.items : 
            (eventType === 'paste') ? 
                event.clipboardData.items : null
    );

    if (items == null) {
        console.error("Undefined event.");
        return;
    }
    
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && items[i].type === 'image/webp') {
            event.preventDefault();
            const file = items[i].getAsFile();
            await convertAndDispatch(file, event, eventType);
        }
    }
}


/**
 * Convert the given file and dispatch the new event.
 *
 * @param {File} file - The file to process.
 * @param {Event} event - The original event object.
 * @param {string} eventType - The type of the event ('drop' or 'paste').
 */
async function convertAndDispatch(file, event, eventType) {
    console.log("process call:", eventType, file);

    const dataURL = await readFile(file);
    const img = await loadImage(dataURL);

    const pngBlob = await convertImage2PNGBlob(img);

    if (eventType === 'paste') await copyData(pngBlob);

    const pngFile = new File([pngBlob], file.name.replace(/\.webp$/, '.png'), { type: 'image/png' });

    const dataTransfer = createDataTransfer(pngFile);
    const newEvent = (
            (eventType === 'drop') ? 
                createNewDropEvent(dataTransfer, event) : 
            (eventType === 'paste') ? 
                createNewPasteEvent(dataTransfer, event) : null
    );
    
    if (newEvent){
        dispatchNewEvent(newEvent, eventType);
    }
    
}


/**
 * Read the file and return its data URL.
 *
 * @param {File} file - The file to read.
 * @returns {Promise<string>} The promise that resolves with the data URL of the file.
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


/**
 * Load the image from the data URL.
 *
 * @param {string} dataURL - The data URL of the image.
 * @returns {Promise<HTMLImageElement>} The promise that resolves with the loaded image.
 */
function loadImage(dataURL) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataURL;
    });
}


/**
 * Convert the image element to the PNG blob.
 *
 * @param {HTMLImageElement} image - The image element to convert.
 * @returns {Promise<Blob>} The promise that resolves with the PNG blob.
 */
function convertImage2PNGBlob(image) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
}


/**
 * Copy the PNG blob to the clipboard.
 *
 * @param {Blob} blob - The PNG blob to copy.
 */
async function copyData(blob) {
    try {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]); 
        //console.log("copy to clipboard successful.");
    } catch (error) {
        console.error("Copy to clipboard failed:", error);
    }
}


/**
 * Create the DataTransfer object containing the given file.
 *
 * @param {File} file - The file to add to the DataTransfer object.
 * @returns {DataTransfer} The created DataTransfer object.
 */
function createDataTransfer(file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    return dataTransfer;
}


/**
 * Create the new drop event with the given DataTransfer and original event properties.
 *
 * @param {DataTransfer} dataTransfer - The DataTransfer object to attach to the new event.
 * @param {DragEvent} originalEvent - The original drop event.
 * @returns {DragEvent} The created drop event.
 */
function createNewDropEvent(dataTransfer, originalEvent) {
    const newEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        clientX: originalEvent.clientX,
        clientY: originalEvent.clientY,
        screenX: originalEvent.screenX,
        screenY: originalEvent.screenY,
        dataTransfer: dataTransfer,
        sourceCapabilities: originalEvent.sourceCapabilities
    });

    Object.defineProperty(newEvent, 'srcElement', { value: originalEvent.srcElement });
    Object.defineProperty(newEvent, 'target', { value: originalEvent.target });

    newEvent.dataTransfer.dropEffect = originalEvent.dataTransfer.dropEffect;
    newEvent.dataTransfer.effectAllowed = originalEvent.dataTransfer.effectAllowed;

    return newEvent;
}


/**
 * Create the new paste event with the given DataTransfer and original event properties.
 *
 * @param {DataTransfer} dataTransfer - The DataTransfer object to attach to the new event.
 * @param {ClipboardEvent} originalEvent - The original paste event.
 * @returns {ClipboardEvent} The created paste event.
 */
function createNewPasteEvent(dataTransfer, originalEvent) {
    const newEvent = new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: dataTransfer,
        composed: true
    });

    Object.defineProperty(newEvent, 'srcElement', { value: originalEvent.srcElement });
    Object.defineProperty(newEvent, 'target', { value: originalEvent.target });
    Object.defineProperty(newEvent, 'currentTarget', { value: originalEvent.currentTarget });

    newEvent.clipboardData.dropEffect = 'none';
    newEvent.clipboardData.effectAllowed = 'uninitialized';

    return newEvent;
}


/**
 * Dispatch the new event to the target element.
 *
 * @param {Event} event - The event to dispatch.
 * @param {string} eventType - The type of the event ('drop' or 'paste').
 */
function dispatchNewEvent(event, eventType) {
    const targetElement = (
            (eventType === 'drop') ? 
                document.elementFromPoint(event.clientX, event.clientY) :
            (eventType === 'paste' ? 
                document.activeElement : null
    ));

    if (targetElement) {
        targetElement.dispatchEvent(event);
    } else {
        console.error("Failed to dispatch event: Undefined target element.");
    }
}


/*
// for check events change
const allEvents = [
    'abort', 'animationend', 'animationiteration', 'animationstart', 'beforeinput',
    'canplay', 'canplaythrough', 'change', 'click', 'close', 'contextmenu',
    'cuechange', 'dblclick', 'drag', 'dragend', 'dragenter', 'dragleave', 'dragover',
    'dragstart', 'drop', 'durationchange', 'emptied', 'ended', 'error',
    'gotpointercapture', 'input', 'invalid', 'keydown', 
    'keypress', 'keyup', 'load', 'loadeddata', 'loadedmetadata', 'loadstart', 'lostpointercapture', 
    'pause', 'play', 'playing', 'pointercancel',
    'progress', 'paste',
    'ratechange', 'reset', 'resize', 'securitypolicyviolation', 'seeked', 
    'seeking', 'select', 'selectstart', 'stalled', 'submit', 
    'suspend', 'timeupdate', 'toggle', 'touchcancel', 'touchend', 'touchmove', 
    'touchstart', 'transitionend', 'volumechange', 'waiting'
];

function logEvent(event) {
    console.log(`Event: ${event.type}`);
    console.log(`Target: ${event.target}`);
    console.log(event);
}

allEvents.forEach(eventType => {
    document.addEventListener(eventType, logEvent, true);
});

*/
