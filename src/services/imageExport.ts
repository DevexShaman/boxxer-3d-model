/**
 * Service to export the current 3D scene as a high-resolution PNG
 */
export const exportSceneToImage = async (canvas: HTMLCanvasElement): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            // The canvas.toDataURL works because we set preserveDrawingBuffer: true in the Canvas component
            const dataUrl = canvas.toDataURL('image/png', 1.0);

            // Create a temporary link to download the image
            const link = document.createElement('a');
            link.download = `custom-product-${Date.now()}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            resolve(dataUrl);
        } catch (error) {
            console.error('Failed to export image:', error);
            reject(error);
        }
    });
};

/**
 * Convert dataURL to Blob for uploading
 */
export const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};
