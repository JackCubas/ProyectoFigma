async function convert(){
    
    const jpgImageBytes = await fetch("./carretera.jpg").then((res) => res.arrayBuffer())
    const pngImageBytes = await fetch("./duck.png").then((res) => res.arrayBuffer())

    const pdfDoc = await PDFLib.PDFDocument.create()

    const jpgImage = await pdfDoc.embedJpg(jpgImageBytes)
    const pngImage = await pdfDoc.embedPng(pngImageBytes)

    const jpgDims = jpgImage.scale(0.5)
    const pngDims = pngImage.scale(0.5)

    const page = pdfDoc.addPage()

    page.drawImage(jpgImage, {
        x: page.getWidth() / 2 - jpgDims.width / 2,
        y: page.getHeight() / 2 - jpgDims.height / 2 + 250,
        width: jpgDims.width,
        height: jpgDims.height,
    })
    page.drawImage(pngImage, {
        x: page.getWidth() / 2 - pngDims.width / 2 + 75,
        y: page.getHeight() / 2 - pngDims.height + 250,
        width: pngDims.width,
        height: pngDims.height,
    })

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], {
        type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);

    // Create a link element to trigger the download.
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "modified_document_stamp.pdf"; // Specify the filename for the downloaded PDF.

    // Append the link to the body and click it to trigger the download.
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}