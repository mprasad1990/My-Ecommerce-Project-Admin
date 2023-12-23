export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (error) => reject(error));
        image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
        image.src = url;
    });

export function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width, height, rotation) {
    const rotRad = getRadianAngle(rotation);

    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

export const resizeBlobImage = (blob, maxWidth, maxHeight) => {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let width = maxWidth;
            let height = maxHeight;

            // Calculate new dimensions while maintaining the aspect ratio
            // if (width > maxWidth) {
            //     height *= maxWidth / width;
            //     width = maxWidth;
            // }

            // if (height > maxHeight) {
            //     width *= maxHeight / height;
            //     height = maxHeight;
            // }

            // Set the canvas dimensions to the new size
            canvas.width = width;
            canvas.height = height;

            // Draw the image onto the canvas with the new dimensions
            ctx.drawImage(img, 0, 0, width, height);

            // Convert the canvas content back to a data URL

            // canvas.toBlob((file) => {
            //     resolve(URL.createObjectURL(file));
            // }, "image/jpeg");

            const base64Image = canvas.toDataURL('image/jpeg');
            resolve(base64Image);


            //const resizedDataURL = canvas.toDataURL('image/jpeg'); // You can change the format if needed

            //resolve(resizedDataURL);
        };

        img.onerror = function(error) {
            reject(error);
        };

        img.src = blob;

    });

}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
    imageSrc,
    pixelCrop,
    rotation = 0,
    cropWidth,
    cropHeight,
    flip = { horizontal: false, vertical: false }
) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return null;
    }

    const rotRad = getRadianAngle(rotation);

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    );

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw rotated image
    ctx.drawImage(image, 0, 0);

    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0);

    // As Base64 string
    // return canvas.toDataURL('image/jpeg');

    // As a blob
    return new Promise((resolve, reject) => {
        const base64Image = canvas.toDataURL('image/jpeg');
        resolve(resizeBlobImage(base64Image, cropWidth, cropHeight));

        // canvas.toBlob((file) => {
        //     var blobData = URL.createObjectURL(file);
        //     resolve(resizeBlobImage(blobData, cropWidth, cropHeight));
        // }, "image/jpeg");
    });



}