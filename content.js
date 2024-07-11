//console.log("content.js load")


// Register event listeners
document.addEventListener('drop', handleDrop);
document.addEventListener('paste', handlePaste);


/**
 * Handle the drop event and process the dropped items.
 *
 * @param {DragEvent} event - The drop event object.
 */
async function handleDrop(event) {
    console.log("drop event :", event, typeof(event));

    const items = event.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
        //console.log("item :", items[i]);

        if (items[i].kind === 'file' && items[i].type === 'image/webp') {
            event.preventDefault();
            const file = items[i].getAsFile();
            await convertWebP2PNGAndDispatchDrop(file, event);
        }
    }
}


/**
 * Convert WebP image to PNG format   
 * And dispatch new drop event.
 *
 * @param {File} file - The original WebP file.
 * @param {DragEvent} originalEvent - The original drop event.
 */
async function convertWebP2PNGAndDispatchDrop(file, originalEvent) {
    //console.log("call convert :", file);

    // read and load webp image
    const dataURL = await readFile(file);
    const img = await loadImage(dataURL);

    // convert webp to png image
    const pngBlob = await convertImage2PNGBlob(img);
    const pngFile = new File([pngBlob], file.name.replace(/\.webp$/, '.png'), { type: 'image/png' });

    // create and dispatch event based on original event information and converted image
    const dataTransfer = createDataTransfer(pngFile);
    const newEvent = createNewDropEvent(dataTransfer, originalEvent);
    dispatchDropEvent(newEvent, originalEvent.clientX, originalEvent.clientY);
}


/**
 * Read the file and return its data URL.
 *
 * @param {File} file - The file to read.
 * @returns {Promise<string>} The promise that resolves with the data URL of the file.
 */
function readFile(file) {
    return new Promise((resolve, reject) => {
        //console.log("call func : readFile :", file);

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
        //console.log("call func : loadImage :", dataURL);

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
        //console.log("call func : convertImage2PNGBlob :", image);

        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
}


/**
 * Create the DataTransfer object containing the given file.
 *
 * @param {File} file - The file to add to the DataTransfer object.
 * @returns {DataTransfer} The created DataTransfer object.
 */
function createDataTransfer(file) {
    //console.log("call func : createDataTransfer :", file);

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
    //console.log("call func : createNewDropEvent :", dataTransfer);

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
 * Dispatch the drop event at the specified coordinates.
 *
 * @param {DragEvent} event - The drop event to dispatch.
 * @param {number} clientX - The client X coordinate for the drop event.
 * @param {number} clientY - The client Y coordinate for the drop event.
 */
function dispatchDropEvent(event, clientX, clientY) {
    //console.log("call func : dispatchDropEvent :", event);

    const targetElement = document.elementFromPoint(clientX, clientY);
    if (targetElement) {
        targetElement.dispatchEvent(event);
    }
}


async function handlePaste(event) {
    console.log("paste event :", event, typeof(event));

    if (!event.clipboardData) {
        console.error("Clipboard data is null or undefined.");
        return;
    }

    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        //console.log("item :", items[i]);

        if (items[i].kind === 'file' && items[i].type === 'image/webp') {
            event.preventDefault();
            const file = items[i].getAsFile();
            await convertWebP2PNGAndDispatchPaste(file, event);
        }
    }
}

async function convertWebP2PNGAndDispatchPaste(file, originalEvent) {
    //console.log("call convert :", file);

    const dataURL = await readFile(file);
    const img = await loadImage(dataURL);

    const pngBlob = await convertImage2PNGBlob(img);

    await copyData(pngBlob);

    const pngFile = new File([pngBlob], file.name.replace(/\.webp$/, '.png'), { type: 'image/png' });


    updatePasteEventDataTransfer(originalEvent, pngFile);
}


function createNewPasteEvent(dataTransfer, originalEvent) {
    //console.log("call func : createNewPasteEvent :", dataTransfer);

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

function dispatchPasteEvent(event) {
    //console.log("call func : dispatchPasteEvent :", event);

    const targetElement = document.activeElement;
    if (targetElement) {
        targetElement.dispatchEvent(event);
    }
}


async function copyData(blob) {
    //console.log("call func : copyData :", blob);
    try {
        const item = new ClipboardItem({ "image/png": blob });
        navigator.clipboard.write([item]); 
        //console.log("copy success:");
    } catch (error) {
        console.log("copy fail:", error);
    }
}

function updatePasteEventDataTransfer(originalEvent, pngFile) {
    const items = originalEvent.clipboardData.items;
    
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(pngFile);

    const newEvent = createNewPasteEvent(dataTransfer, originalEvent);
    
    dispatchPasteEvent(newEvent);
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
