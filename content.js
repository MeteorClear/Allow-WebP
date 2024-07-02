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
            await convertWebPToPNG(file, event);
        }
    }
}
  
async function convertWebPToPNG(file, originalEvent) {
    console.log("call convert :", file);

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (blob) => {
                const pngFile = new File([blob], file.name.replace(/\.webp$/, '.png'), { type: 'image/png' });

                const dataTransfer = createDataTransfer(pngFile);

                const newEvent = createNewDropEvent(dataTransfer, originalEvent);

                dispatchDropEvent(newEvent, originalEvent.clientX, originalEvent.clientY);

            }, 'image/png');
        };
    };
    reader.readAsDataURL(file);
}

function createDataTransfer(file) {
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