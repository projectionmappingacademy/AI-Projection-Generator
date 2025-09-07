
/**
 * Converts a File object to a base64 data URL.
 * @param file The file to convert.
 * @returns A promise that resolves with the data URL string.
 */
export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Converts a base64 data URL back into a File object.
 * @param dataUrl The data URL string.
 * @param filename The desired filename for the resulting File object.
 * @returns A promise that resolves with the new File object.
 */
export const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
};


/**
 * Resizes and pads an image to fit within max dimensions while preserving aspect ratio.
 * @param file The image file to process.
 * @param maxWidth The maximum width of the output image.
 * @param maxHeight The maximum height of the output image.
 * @returns A promise that resolves with the processed File object and its data URL.
 */
export const preprocessImage = (
    file: File,
    maxWidth: number,
    maxHeight: number
): Promise<{ file: File; dataUrl: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                const { naturalWidth: width, naturalHeight: height } = img;

                // If image is already within bounds, no processing needed.
                if (width <= maxWidth && height <= maxHeight) {
                     fileToDataUrl(file).then(dataUrl => {
                        resolve({ file, dataUrl });
                    });
                    return;
                }

                const scale = Math.min(maxWidth / width, maxHeight / height);
                const newWidth = Math.floor(width * scale);
                const newHeight = Math.floor(height * scale);

                const canvas = document.createElement('canvas');
                canvas.width = maxWidth;
                canvas.height = maxHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }

                // Fill with black, ideal for projection mapping (no light).
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, maxWidth, maxHeight);

                const x = (maxWidth - newWidth) / 2;
                const y = (maxHeight - newHeight) / 2;

                ctx.drawImage(img, x, y, newWidth, newHeight);

                const dataUrl = canvas.toDataURL('image/png');
                dataUrlToFile(dataUrl, `processed-${file.name}`).then(processedFile => {
                    resolve({ file: processedFile, dataUrl });
                });
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};
