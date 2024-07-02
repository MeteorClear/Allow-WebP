console.log("content.js load")


document.addEventListener('dragover', (event) => {
    console.log("dragover");
    event.preventDefault();
});
  
document.addEventListener('drop', async (event) => {
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
});
  
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

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(pngFile);

                // Create drop event
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
    
                // Set additional properties to mimic the original event
                Object.defineProperty(newEvent, 'srcElement', { value: originalEvent.srcElement });
                Object.defineProperty(newEvent, 'target', { value: originalEvent.target });
                newEvent.dataTransfer.dropEffect = originalEvent.dataTransfer.dropEffect;
                newEvent.dataTransfer.effectAllowed = originalEvent.dataTransfer.effectAllowed;
    
                // Find the target element
                const targetElement = document.elementFromPoint(originalEvent.clientX, originalEvent.clientY);
    
                // Dispatch the event to the target element
                if (targetElement) {
                    targetElement.dispatchEvent(newEvent);
                }
            }, 'image/png');
        };
    };
    reader.readAsDataURL(file);
}

