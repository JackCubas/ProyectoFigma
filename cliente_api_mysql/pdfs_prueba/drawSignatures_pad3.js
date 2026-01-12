document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('signature-pad');
    var signaturePad = new SignaturePad(canvas);
    var undoStack = [];
    var redoStack = [];
    function saveState() {
        undoStack.push(deepCopy(signaturePad.toData()));
        redoStack = [];
    }
    function undo() {
        if (undoStack.length > 0) {
            redoStack.push(deepCopy(signaturePad.toData()));
            undoStack.pop();
            signaturePad.clear();
            if (undoStack.length) {
                var lastStroke = undoStack[undoStack.length - 1];
                signaturePad.fromData(lastStroke, { clear: false });
            }
        }
    }
    function redo() {
        if (redoStack.length > 0) {
            undoStack.push(deepCopy(signaturePad.toData()));
            var nextState = redoStack.pop();
            signaturePad.clear();
            if (nextState.length) {
                signaturePad.fromData(nextState);
            }
        }
    }
    document.getElementById('undo').addEventListener('click', undo);
    document.getElementById('redo').addEventListener('click', redo);
    document.getElementById('clear').addEventListener('click', function () {
        signaturePad.clear();
        undoStack = [];
        redoStack = [];
    });
    document.getElementById('save-png').addEventListener('click', function () {
        if (!signaturePad.isEmpty()) {
            var dataURL = signaturePad.toDataURL('image/png');
            var link = document.createElement('a');
            link.href = dataURL;
            link.download = 'signature.png';
            link.click();
        }
    });
    document.getElementById('save-jpeg').addEventListener('click', function () {
        if (!signaturePad.isEmpty()) {
            var dataURL = signaturePad.toDataURL('image/jpeg');
            var link = document.createElement('a');
            link.href = dataURL;
            link.download = 'signature.jpeg';
            link.click();
        }
    });
    // Save state on drawing end
    signaturePad.addEventListener("endStroke", () => {
        console.log("Signature end");
        saveState();
      });
    // Initial canvas setup
    function resizeCanvas() {
        var ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
        signaturePad.clear(); // otherwise isEmpty() might return incorrect value
        if (undoStack.length > 0) {
            signaturePad.fromData(undoStack[undoStack.length - 1]);
        }
    }
    function deepCopy(data) {
        return JSON.parse(JSON.stringify(data));
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
});

//-------------------------------------
//-------------------------------------
const signatureCanvas = document.getElementById("signature-pad");
const signaturePadPdf = new SignaturePad(signatureCanvas);

// Function to save the signature as an image and insert it into the PDF.
async function saveSignatureAndInsertIntoPDF() {
    const signatureDataUrl = signaturePadPdf.toDataURL("image/png");
    // You can now send this data to the server for processing or save it locally.
    console.log(signatureDataUrl); // Log the signature data URL for demonstration purposes.

    // Call the function to insert the signature into the PDF.
    const modifiedPDFBytes = await insertSignatureIntoPDF(signatureDataUrl);

    // Download the modified PDF with the inserted signature.
    downloadModifiedPDF(modifiedPDFBytes);
}

// Function to insert the signature into the PDF.
async function insertSignatureIntoPDF(signatureDataURL) {
    const pdfBytes = await fetch("document.pdf").then((res) => res.arrayBuffer());
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

    // Convert the data URL to a `Uint8Array`.
    const signatureImageArray = dataURLToUint8Array(signatureDataURL);

    // Embed the signature image as a custom image.
    const signatureImage = await pdfDoc.embedPng(signatureImageArray);
    const { width, height } = signatureImage;

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const x = firstPage.getWidth() - 100 - width; // Adjust the value 100 for the horizontal position.
    const y = firstPage.getHeight() - 100 - height; // Adjust the value 100 for the vertical position.

    // Add the signature image to the first page at the desired location.
    firstPage.drawImage(signatureImage, {
        x: x,
        y: y,
        width: width,
        height: height,
    });

    // Save the modified PDF.
    const modifiedPDFBytes = await pdfDoc.save();
    return modifiedPDFBytes;
}

// Function to convert data URL to a `Uint8Array`.
function dataURLToUint8Array(dataURL) {
    // Extract the Base64-encoded data from the data URL.
    const base64 = dataURL.split(",")[1];

    // Decode the Base64-encoded data into a binary string.
    const binaryString = atob(base64);

    // Create a new `Uint8Array` with the length of the binary string.
    const array = new Uint8Array(binaryString.length);

    // Iterate through the binary string and convert each character to a number and store it in the `Uint8Array`.
    for (let i = 0; i < binaryString.length; i++) {
        array[i] = binaryString.charCodeAt(i);
    }
    return array;
}  

// Function to trigger the download of the modified PDF.
function downloadModifiedPDF(modifiedPDFBytes) {
    const blob = new Blob([modifiedPDFBytes], {
        type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);

    // Create a link element to trigger the download.
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "modified_document.pdf"; // Specify the filename for the downloaded PDF.

    // Append the link to the body and click it to trigger the download.
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}