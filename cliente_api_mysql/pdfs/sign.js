var thisDocName = "";
var userId = null;
var pdfBuffer = null;
var initialTimestampName = "";

var datosUsuario = null;

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

if(datosUsuario.rolUser != "ADMIN" && datosUsuario.rolUser != "FIRMA"){
    window.location.href = "../404.html";
}

document.getElementById("stroke-style").style.display = 'none';

document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('signature-pad');
    var ctx = canvas.getContext('2d');
    var drawing = false;
    var strokeStyle = 'pen';
    var signatureData = null;

    function resizeCanvas() {
        if (signatureData) {
            var img = new Image();
            img.src = signatureData;
            img.onload = function () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                setStrokeStyle();
            };
        } else {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            setStrokeStyle();
        }
    }

    function setStrokeStyle() {
        if (strokeStyle === 'pen') {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
        } else if (strokeStyle === 'brush') {
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
        }
    }

    function startDrawing(e) {
        drawing = true;
        ctx.beginPath();
        ctx.moveTo(e.offsetX || e.touches[0].clientX - canvas.offsetLeft, e.offsetY || e.touches[0].clientY - canvas.offsetTop);
    }

    function draw(e) {
        if (drawing) {
            ctx.lineTo(e.offsetX || e.touches[0].clientX - canvas.offsetLeft, e.offsetY || e.touches[0].clientY - canvas.offsetTop);
            ctx.stroke();
        }
    }

    function stopDrawing() {
        drawing = false;
        signatureData = canvas.toDataURL();
    }

    function exportCanvas(format) {
        var exportCanvas = document.createElement('canvas');
        exportCanvas.width = canvas.width;
        exportCanvas.height = canvas.height;
        var exportCtx = exportCanvas.getContext('2d');

        // Fill the background with white
        exportCtx.fillStyle = '#fff';
        exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // Draw the signature
        exportCtx.drawImage(canvas, 0, 0);

        // Export the canvas
        var dataURL = exportCanvas.toDataURL(`image/${format}`);
        var link = document.createElement('a');
        link.href = dataURL;
        link.download = `signature.${format}`;
        link.click();
    }

    // Mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);

    document.getElementById('clear').addEventListener('click', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        signatureData = null;
    });

    document.getElementById('stroke-style').addEventListener('change', function (e) {
        strokeStyle = e.target.value;
        setStrokeStyle();
    });

    document.getElementById('export-png').addEventListener('click', function () {
        exportCanvas('png');
    });

    document.getElementById('export-jpeg').addEventListener('click', function () {
        exportCanvas('jpeg');
    });

    // Initial canvas setup
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
});

//-------------------------------------
//-------------------------------------
const signatureCanvas = document.getElementById("signature-pad");
const signaturePad = new SignaturePad(signatureCanvas);

var URLString = window.location.href.split('?');
var datosURL = URLString[1].split('&');
var idHTML = datosURL[0].replace("id=","");

/*if(idHTML === "" || isNaN(idHTML)){
    window.location.href = 'table_pag.html?page=1';
}*/

var pageHTML = datosURL[1].replace("page=","");

// Function to save the signature as an image and insert it into the PDF.
async function saveSignatureAndInsertIntoPDF() {
    const signatureDataUrl = signaturePad.toDataURL("image/png");
    // You can now send this data to the server for processing or save it locally.
    console.log(signatureDataUrl); // Log the signature data URL for demonstration purposes.

    // Call the function to insert the signature into the PDF.
    const modifiedPDFBytes = await insertSignatureIntoPDF(signatureDataUrl);

    // Download the modified PDF with the inserted signature.
    downloadModifiedPDF(modifiedPDFBytes);
}

async function saveToServer() {
    const signatureDataUrl = signaturePad.toDataURL("image/png");
    // You can now send this data to the server for processing or save it locally.
    console.log(signatureDataUrl); // Log the signature data URL for demonstration purposes.

    // Call the function to insert the signature into the PDF.
    const modifiedPDFBytes = await insertSignatureIntoPDF(signatureDataUrl);

    // Send the modified PDF with the inserted signature.
    sendData(modifiedPDFBytes);
}

// Function to insert the signature into the PDF.
async function insertSignatureIntoPDF(signatureDataURL) {
    //const pdfBytes = await fetch("document.pdf").then((res) => res.arrayBuffer());
    const pdfBytes = pdfBuffer;
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

    // Convert the data URL to a `Uint8Array`.
    const signatureImageArray = dataURLToUint8Array(signatureDataURL);

    // Embed the signature image as a custom image.
    const signatureImage = await pdfDoc.embedPng(signatureImageArray);
    const { width, height } = signatureImage;

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    //const x = firstPage.getWidth() - 100 - width; // Adjust the value 100 for the horizontal position.
    const x = (firstPage.getWidth()/2) - (width/2)
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
    console.log(modifiedPDFBytes);
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



async function sendData(modifiedPDFBytes){

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    //var array = modifiedPDFBytes.toBase64();

    var pdfBlob = new Blob([modifiedPDFBytes], {
        type: "application/pdf",
    });

    //console.log(pdfBlob);
    //console.log(thisDocName);

    const URLSERVERsign = "http://localhost:3000/sign/";

    var formData = new FormData();
    formData.append("filename", thisDocName);
    formData.append("uploadedFile", pdfBlob);
    formData.append("initialTimestampName", initialTimestampName);
    formData.append("originalUserId", userId);
    formData.append("signUserId", datosUsuario.id);


    const apiCall = await fetch(URLSERVERsign + idHTML, {
        method: "PUT",
        headers: {
            "Accept": "application/json"
        },
        body: formData,
    }
    );

    const result = await apiCall.json();
    console.log(result);

    if(result.status === 400 || result.status === 500 || result.hasOwnProperty("error")){
        alert("No se ha podido firmar documento");
    }else{
        //console.log(response);
        alert("Documento firmado correctamente");
    } 

    window.location.href = "table.html?page=" + pageHTML;

}

async function returnDataOriginal() {
    const URLSERVERdetail = "http://localhost:3000/pdfs/";

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    //console.log("return data");
    return fetch(URLSERVERdetail + idHTML)
        .then((response) => { 
            return response.json().then((data) => {
                thisDocName = data[0].DocName;
                userId = data[0].userId;

                var initialTimestampNameAux = data[0].initialUploadTimestamp.slice(0, 19).replace('T', ' ');
                var initialTimestampNameAux2 = initialTimestampNameAux.replace(" ","_").replaceAll(":","-");
                initialTimestampName = initialTimestampNameAux2.replaceAll("-","_");

                return appendDataOriginal(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

function appendDataOriginal(data){
    if(data.length !== 0){

        for(let i=0;i<data.length;i++){
            console.log(data[i]);

            thisDocName = data[i].DocName;
            userId = data[i].userId;
            
            var initialTimestampNameAux = data[0].initialUploadTimestamp.slice(0, 19).replace('T', ' ');
            var initialTimestampNameAux2 = initialTimestampNameAux.replace(" ","_").replaceAll(":","-");
            initialTimestampName = initialTimestampNameAux2.replaceAll("-","_");

        }
    }    
    //console.log("finalizado generacion de ventana");
}

function onbuttonclicked() {
  //"location.href='table_pag.html?page=' + pageHTML";
  if (onbuttonclicked) {
    window.location.href = "table.html?page=" + pageHTML;
  }
}

async function returnDataSign() {
    const URLSERVERdetail = "http://localhost:3000/pdfSign/";

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    //console.log("return data");
    return fetch(URLSERVERdetail + idHTML)
        .then((response) => { 
            return response.json().then((data) => {
                return appendDataSign(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

function appendDataSign(data){

    var buttons = document.getElementById("button-container");

    var buttonCan = document.createElement("button");
    buttonCan.innerHTML = "Cancel";
    buttonCan.onclick = onbuttonclicked;
    buttons.appendChild(buttonCan);

    var con=document.getElementById("main-container");


    if(data.length !== 0){

        document.getElementById("saveServer").disabled = true;
        document.getElementById("savePDF").disabled = true;

        for(let i=0;i<data.length;i++){
            console.log(data[i]);

            var d=document.createElement("div");
            d.textContent="Doc Name: " + data[i].DocName;
            thisDocName = data[i].DocName;                     
            con.appendChild(d);

            var e=document.createElement("div")
            e.textContent="Doc URL: " + data[i].urlCarpeta                      
            con.appendChild(e);

            var f=document.createElement("div")
            f.textContent="Sign User Name: " + data[i].nameUser                      
            con.appendChild(f);

            var g=document.createElement("div")
            g.textContent="Estado: " + data[i].estado                      
            con.appendChild(g);

            var initialTimestampNameAux = data[0].initialUploadTimestamp.slice(0, 19).replace('T', ' ');
            var initialTimestampNameAux2 = initialTimestampNameAux.replace(" ","_").replaceAll(":","-");
            initialTimestampName = initialTimestampNameAux2.replaceAll("-","_");

            var h=document.createElement("div");
            h.textContent="Creation DateTime: " + initialTimestampNameAux;                      
            con.appendChild(h);

            var k=document.createElement("div");
            var signTimestampNameAux = data[0].signTimestamp.slice(0, 19).replace('T', ' ');
            k.textContent="Sign DateTime: " + signTimestampNameAux;                      
            con.appendChild(k);
        }
    }else{
        document.getElementById("delete").disabled = true;
        console.log("No hay documento firmado");
        //alert("No hay documento firmado");

        var j=document.createElement("div");
        j.textContent="No hay documento firmado";
        con.appendChild(j);
    }
    //console.log("finalizado generacion de ventana");
}

async function retrievePDF() {

    const URLSERVERretrieve = "http://localhost:3000/retrieve/";

    //console.log("retrieve pdf: " + URLSERVERretrieve + thisDocName);
    return fetch(URLSERVERretrieve + thisDocName + "/" + userId + "/" + initialTimestampName + "/" + "SIGN", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => { 
        //console.log(response);
        return response.blob().then((data) => {
                    //console.log(data);
                    pdfBuffer = blobToArray(data);
                    return generateWindow(data);
                }).catch((err) => {
                    console.log(err);
                }) 


    });
    

}

function generateWindow(response){
    //pdfBuffer = response.data;
    const fileURL = URL.createObjectURL(response);
    console.log(fileURL);
    window.open(fileURL); 
}

function checkUserHosting(){
    returnDataOriginal().then(() => {
        returnDataSign();
    }).then(() => {
        retrievePDF();
    })
}

async function blobToArray(data){
    console.log("blob to array");
    console.log(data);
    //var fileReader  = new FileReader();
    /*fileReader.onload = function(event) {
        arrayBuffer = event.target.result;
    };*/
    //await fileReader.readAsArrayBuffer(data);
    //console.log(fileReader.result);
    //return fileReader.result;

    pdfBuffer = await data.arrayBuffer();
    console.log(pdfBuffer);
    return await data.arrayBuffer();
}

checkUserHosting();

async function deleteDocument(){
    //alert("delete document");

    const URLSERVERDelete = "http://localhost:3000/eliminateDocSign";

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    const response = await fetch(URLSERVERDelete + '?id=' + idHTML + '&docName=' + thisDocName + '&userId=' + userId + '&initialTimestampName=' + initialTimestampName, {
        method: "DELETE"
    })

    const result = await response.json();
    console.log(result);

    if(result.status === 400 || result.status === 500 || result.hasOwnProperty("error")){
        alert("No se ha podido borrar documento firmado");
    }else{
        //console.log(response);
        alert("Documento firmado borrado correctamente");
    }

    window.location.href = "table.html?page=" + pageHTML;
}