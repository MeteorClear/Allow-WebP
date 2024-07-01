document.addEventListener('drop', async (event) => {
    const items = event.dataTransfer.items;

    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file' && items[i].type === 'image/webp') {
            const file = items[i].getAsFile();
            convertWebPToPNG(file);

            // insert converted file
        }
    }
});

function convertWebPToPNG(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();

        img.src = e.target.result;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(blob => {
                const pngFile = new File([blob], file.name.replace(/\.webp$/, '.png'), { type: 'image/png' });
            }, 'image/png');
        };
    };
    reader.readAsDataURL(file);
}