const createFileName = () => {
    const date = new Date();
    return `screenshot_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
};

const dataURLToBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i += 1) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
};

const uploadAsset = async (dataURL, fileName) => {
    const formData = new FormData();
    const blob = dataURLToBlob(dataURL);
    formData.append('file', blob, fileName);

    const request = new XMLHttpRequest();
    request.open('POST', window.location.pathname);
    request.send(formData);

    return new Promise((resolve, reject) => {
        request.addEventListener('load', () => {
            const asset = JSON.parse(request.responseText);
            resolve(asset);
        });
        request.addEventListener('error', () => {
            reject(new Error('Failed to upload screenshot'));
        });
    });
};

const captureScreenshot = async () => {
    const canvas = document.querySelector('body transient canvas[data-engine]');
    if (!canvas) {
        console.warn('Screenshot failed: No canvas found');
        return;
    }

    const dataURL = canvas.toDataURL('image/png');
    const asset = await uploadAsset(dataURL, createFileName() + '.png');

    CustomJSTrigger.trigger('imageUploaded', { fileName: asset.fileName });
};
window.captureScreenshot = captureScreenshot;



exports.captureScreenshot = captureScreenshot;
