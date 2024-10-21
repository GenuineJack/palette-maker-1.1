const imageUpload = document.getElementById('image-upload');
const saveImageButton = document.getElementById('save-image');
const imagePreview = document.getElementById('image-preview');
const colorPaletteContainer = document.getElementById('color-palette');
const finalCanvas = document.getElementById('final-canvas');
const ctx = finalCanvas.getContext('2d');
const logoUrl = 'https://images.squarespace-cdn.com/content/v1/658488e71ebc22517acdad54/d971cfa2-73cf-4357-bb0d-a50098b2b7df/FINE-ART-BC-LOGO.jpg';  // Updated logo URL

let uploadedImage;

// Automatically generate palette after image upload
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';

            // Automatically generate the color palette
            const colorThief = new ColorThief();
            if (imagePreview.complete) {
                const colors = colorThief.getPalette(imagePreview, 5);
                displayColors(colors);
                document.getElementById('result').style.display = 'block';  // Show save image button
            } else {
                imagePreview.onload = function () {
                    const colors = colorThief.getPalette(imagePreview, 5);
                    displayColors(colors);
                    document.getElementById('result').style.display = 'block';  // Show save image button
                };
            }
        };
        reader.readAsDataURL(file);
        uploadedImage = file;
    }
});

// Function to display color palette with HEX codes and a copy button
function displayColors(colors) {
    colorPaletteContainer.innerHTML = '';  // Clear previous palette

    colors.forEach(color => {
        const colorBlockContainer = document.createElement('div');
        colorBlockContainer.classList.add('color-block-container');

        const colorBlock = document.createElement('div');
        colorBlock.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        colorBlock.classList.add('color-block');

        const hexCode = rgbToHex(color[0], color[1], color[2]);
        const hexCodeElement = document.createElement('div');
        hexCodeElement.classList.add('hex-code');
        hexCodeElement.textContent = hexCode.toUpperCase();

        const copyButton = document.createElement('div');
        copyButton.classList.add('copy-btn');
        copyButton.textContent = "[Copy]";
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(hexCode.toUpperCase());
            alert(`Copied: ${hexCode.toUpperCase()}`);
        });

        colorBlockContainer.appendChild(colorBlock);
        colorBlockContainer.appendChild(hexCodeElement);
        colorBlockContainer.appendChild(copyButton);
        colorPaletteContainer.appendChild(colorBlockContainer);
    });
}

// Helper function to convert RGB to HEX
function rgbToHex(r, g, b) {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

// Draw image, palette, and logo on the canvas, and save the image
saveImageButton.addEventListener('click', () => {
    // Clear the canvas and set dimensions
    ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
    finalCanvas.width = 1080;
    finalCanvas.height = 1080;

    // Step 1: Fill the canvas with a white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Step 2: Draw the uploaded image on the canvas
    const image = new Image();
    image.src = imagePreview.src;

    image.onload = function () {
        const maxImageWidth = finalCanvas.width - 40;
        const maxImageHeight = finalCanvas.height - 200;
        const imageAspectRatio = image.naturalWidth / image.naturalHeight;

        let resizedImageWidth, resizedImageHeight;
        if (image.naturalWidth > image.naturalHeight) {
            resizedImageWidth = Math.min(maxImageWidth, image.naturalWidth);
            resizedImageHeight = resizedImageWidth / imageAspectRatio;
        } else {
            resizedImageHeight = Math.min(maxImageHeight, image.naturalHeight);
            resizedImageWidth = resizedImageHeight * imageAspectRatio;
        }

        const imageX = (finalCanvas.width - resizedImageWidth) / 2;
        const imageY = 20;

        // Draw the image on the canvas
        ctx.drawImage(image, imageX, imageY, resizedImageWidth, resizedImageHeight);

        // Step 3: Draw the color palette on the canvas
        const colors = new ColorThief().getPalette(imagePreview, 5);
        const paletteY = imageY + resizedImageHeight + 25;

        colors.forEach((color, index) => {
            ctx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            const colorX = imageX + index * 110;
            ctx.fillRect(colorX, paletteY, 100, 100);

            const hexCode = rgbToHex(color[0], color[1], color[2]);
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(hexCode.toUpperCase(), colorX + 50, paletteY + 55);
        });

        // Step 4: Draw the updated logo on the canvas, now 200px wide
        const logo = new Image();
        logo.src = logoUrl;

        logo.crossOrigin = "Anonymous";  // Handle cross-origin issues

        logo.onload = function () {
            const logoWidth = 200;  // Increase logo size to 200px
            const logoHeight = logo.height * (logoWidth / logo.width);
            const logoX = finalCanvas.width - logoWidth - 20;
            const logoY = paletteY + 100 - logoHeight;

            ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

            // Step 5: Save the image after all components are drawn
            saveCanvasAsImage();
        };

        logo.onerror = function () {
            console.error("Error loading the logo. Check for cross-origin issues.");
            saveCanvasAsImage();  // Save without logo if there's an error
        };
    };
});

// Function to save the canvas content as a PNG
function saveCanvasAsImage() {
    const link = document.createElement('a');
    link.download = 'image_with_palette_and_logo.png';
    link.href = finalCanvas.toDataURL('image/png');  // Use PNG for better quality
    link.click();
}
