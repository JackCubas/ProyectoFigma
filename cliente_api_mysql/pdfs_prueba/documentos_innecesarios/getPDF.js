const URLSERVERpdfs = "http://localhost:3000/pdfs";

var pdfBytes;

function checkUserHosting() {

    return fetch(URLSERVERpdfs)
        .then((response) => { 
            return response.json().then((data) => {
                return appendData(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

function appendData(data){
        //var con=document.getElementById("main-container")
        for(let i=0;i<data.length;i++){
            console.log(data[i]);
            //downloadModifiedPDF(data[i].pdfBase64, i);
            //pdfBytes = new Uint8Array(data[i].docBlob);
            pdfBytes = String(data[i].docBlob);
        }
}

async function sendData(){
    //downloadModifiedPDF(pdfBytes, 1)

    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytesDownload = await pdfDoc.save()

	// Trigger the browser to download the PDF document
    download(pdfBytesDownload, "pdf-lib_modification_example.pdf", "application/pdf");
}



/*function downloadModifiedPDF(modifiedPDFBytes, num) {
    const blob = new Blob([modifiedPDFBytes], {
        type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);

    // Create a link element to trigger the download.
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    pdfNombre = "recovered_doc_" + num + ".pdf" 
    downloadLink.download = pdfNombre; // Specify the filename for the downloaded PDF.

    // Append the link to the body and click it to trigger the download.
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}*/

checkUserHosting();

