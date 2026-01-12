const URLSERVERDelete = "http://localhost:3000/eliminateDocOriginal";

const URLSERVERdetail = "http://localhost:3000/pdfs/";
const URLSERVERretrieve = "http://localhost:3000/retrieve/";

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

var thisDocName = "";
var userId = null;
var initialTimestampName = "";

var URLString = window.location.href.split('?');
var datosURL = URLString[1].split('&');
var idHTML = datosURL[0].replace("id=","");

/*if(idHTML === "" || isNaN(idHTML)){
    window.location.href = 'table_pag.html?page=1';
}*/

var pageHTML = datosURL[1].replace("page=","");
var newHTML = datosURL[2].replace("new=","");

console.log("Current page: " + pageHTML);
console.log("New page: " + newHTML);


async function returnData() {

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    console.log("return data");
    return fetch(URLSERVERdetail + idHTML)
        .then((response) => { 
            return response.json().then((data) => {
                thisDocName = data[0].DocName;
                userId = data[0].userId;
                return appendData(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

async function retrievePDF() {

    console.log("retrieve pdf: " + URLSERVERretrieve + thisDocName + "/" + userId + "/" + initialTimestampName + "/" + "ORIGINAL");
    return fetch(URLSERVERretrieve + thisDocName + "/" + userId + "/" + initialTimestampName + "/" + "ORIGINAL", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => { 
        console.log(response);
        return response.blob().then((data) => {
                    console.log(data);
                    return generateWindow(data);
                }).catch((err) => {
                    console.log(err);
                }) 


    });
    

}

//pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, nameUser, userId
function appendData(data){
    var con=document.getElementById("main-container")
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
        f.textContent="User Name: " + data[i].nameUser                      
        con.appendChild(f);

        var g=document.createElement("div")
        g.textContent="Estado: " + data[i].estado                      
        con.appendChild(g);

        var h=document.createElement("div");

        var initialTimestampNameAux = data[0].initialUploadTimestamp.slice(0, 19).replace('T', ' ');
        var initialTimestampNameAux2 = initialTimestampNameAux.replace(" ","_").replaceAll(":","-");
        initialTimestampName = initialTimestampNameAux2.replaceAll("-","_");

        h.textContent="Creation DateTime: " + initialTimestampNameAux;                      
        con.appendChild(h);
    }

    var buttons = document.getElementById("button-container");

    var buttonSub = document.createElement("button");
    buttonSub.innerHTML = "Submit";
    buttonSub.onclick = sendData;
    buttons.appendChild(buttonSub);  

    var buttonCan = document.createElement("button");
    buttonCan.innerHTML = "Cancel";
    buttonCan.onclick = onbuttonclicked;
    buttons.appendChild(buttonCan); 
}

function onbuttonclicked() {
  //"location.href='table_pag.html?page=' + pageHTML";
  if (onbuttonclicked) {
    window.location.href = "table.html?page=" + pageHTML;
  }
}

function generateWindow(response){

    const fileURL = URL.createObjectURL(response);
    console.log(fileURL);
    window.open(fileURL); 
}

function checkUserHosting(){

    //var idHTML = null;
    //var datosURL = window.location.href.split('?');
    //idHTML = datosURL[1].replace("id=","");

    if(idHTML === null || idHTML === ""){
        window.location.href = "table.html";
    }else{

        returnData().then(() => {
            retrievePDF();
        })

    }
    
}

checkUserHosting();

async function sendData(){

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    //console.log(URLSERVERDelete + '?id=' + idHTML + '&docName=' + thisDocName);

    //console.log("delete pdf: " + URLSERVERDelete + idHtml);
    //alert("delete pdf: " + URLSERVERDelete + idHtml);

    const response = await fetch(URLSERVERDelete + '?id=' + idHTML + '&docName=' + thisDocName + '&userId=' + userId + '&initialTimestampName=' + initialTimestampName, {
        method: "DELETE"
    })

    const result = await response.json();
    console.log(result);

    if(result.status === 400 || result.status === 500 || result.hasOwnProperty("error")){
        alert("No se ha podido borrar documento");
        window.location.href = "table.html?page=" + pageHTML;
    }else{
        //console.log(response);
        alert("Documento borrado correctamente");
        window.location.href = "table.html?page=" + newHTML;        
    }

    //window.location.href = "table.html?page=" + newHTML;

}
