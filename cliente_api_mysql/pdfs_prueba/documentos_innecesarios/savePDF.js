const URLSERVERCreate = "http://localhost:3000/create-pdf";
//var datosURL = window.location.href;

//if(datosURL.includes("?") || datosURL.includes("&") || datosURL.includes("=")){
//    window.location.href = "pdf.html";
//}

var pdfBytes;
var pdfDoc;
var blob;

async function checkUserHosting() {
    //alert("pdfDoc");

    pdfBytes = await fetch("document.pdf").then((res) => res.arrayBuffer());
    pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

    console.log(pdfBytes);
    //console.log(pdfDoc);

    //alert(pdfDoc);

    blob = new Blob(pdfDoc, {
        type: "application/pdf",
    });
}

async function sendData(){


    const nuevoPDF = {
        userId: 2,
        name: "pdfPrueba3",
        docBlob: blob
        
    }

    await fetch(URLSERVERCreate, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(nuevoPDF)
    })

}

checkUserHosting()