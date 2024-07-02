console.log("content.js load")

document.addEventListener('dragover', handleDragover);
document.addEventListener('drop', handleDrop);

function handleDragover(event) {
    console.log("dragover");
    event.preventDefault();
}

async function handleDrop(event) {
    console.log("drop event :", event);

    const items = event.dataTransfer.items;
    for (let i = 0; i < items.length; i++) {
        console.log("item :", items[i]);

        if (items[i].kind === 'file' && items[i].type === 'image/webp') {
            event.preventDefault();
            const file = items[i].getAsFile();
            await convertWebP2PNGAndDispatchDrop(file, event);
        }
    }
}
  
async function convertWebP2PNGAndDispatchDrop(file, originalEvent) {
    console.log("call convert :", file);

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

function readFile(file) {
    return new Promise((resolve, reject) => {
        console.log("call func : readFile :", file);

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function loadImage(dataURL) {
    return new Promise((resolve, reject) => {
        console.log("call func : loadImage :", dataURL);

        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = dataURL;
    });
}

function convertImage2PNGBlob(image) {
    return new Promise((resolve, reject) => {
        console.log("call func : convertImage2PNGBlob :", image);

        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
}

function createDataTransfer(file) {
    console.log("call func : createDataTransfer :", file);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    return dataTransfer;
}

function createNewDropEvent(dataTransfer, originalEvent) {
    console.log("call func : createNewDropEvent :", dataTransfer);

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

function dispatchDropEvent(event, clientX, clientY) {
    console.log("call func : dispatchDropEvent :", event);

    const targetElement = document.elementFromPoint(clientX, clientY);
    if (targetElement) {
        targetElement.dispatchEvent(event);
    }
}