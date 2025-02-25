document.getElementById("imageInput").addEventListener("change", function (event) {
    let imagePreview = document.getElementById("imagePreview");
    imagePreview.innerHTML = ""; // Clear previous previews
    let files = event.target.files;

    if (files.length > 30) {
        alert("You can only upload up to 30 images.");
        return;
    }

    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.classList.add("preview-image");
        img.onload = function () {
            URL.revokeObjectURL(this.src);
        };
        imagePreview.appendChild(img);
    }
});

document.getElementById("extractText").addEventListener("click", async function () {
    let files = document.getElementById("imageInput").files;
    let extractedTextDiv = document.getElementById("extractedText");
    extractedTextDiv.innerHTML = ""; // Clear previous text

    if (files.length === 0) {
        alert("Please upload at least one image!");
        return;
    }

    let allExtractedText = ""; // Store all text

    let promises = []; // Store OCR promises

    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let reader = new FileReader();

        let promise = new Promise((resolve, reject) => {
            reader.onload = function () {
                Tesseract.recognize(reader.result, 'eng', {
                    logger: m => console.log(m), // Log progress
                    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?() ' // Limit characters
                }).then(({ data }) => {
                    let cleanedText = cleanExtractedText(data.text);
                    allExtractedText += cleanedText + " "; // Append text from each image
                    resolve();
                }).catch(error => {
                    console.error(error);
                    reject();
                });
            };

            reader.readAsDataURL(file);
        });

        promises.push(promise);
    }

    await Promise.all(promises);
    
    extractedTextDiv.innerHTML = `<strong>Extracted Text:</strong><br> ${allExtractedText.trim()}`;
    console.log("All images processed.");
});

// 🔥 Function to clean extracted text
function cleanExtractedText(text) {
    return text
        .replace(/[^a-zA-Z0-9\s.,!?'"()-]/g, '') // Remove unwanted characters
        .replace(/\s+/g, ' ') // Remove extra spaces
        .trim(); // Trim leading/trailing spaces
}

// 🖼 Add CSS to improve UI
const style = document.createElement("style");
style.innerHTML = `
    .preview-image {
        width: 100px;
        height: auto;
        margin: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }
    #extractedText {
        padding: 10px;
        border: 1px solid #ddd;
        margin-top: 10px;
        background: #f9f9f9;
        border-radius: 5px;
        white-space: pre-wrap;
        text-align: left;
    }
`;
document.head.appendChild(style);
