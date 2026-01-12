const URLSERVERFirmadoDigital = "http://localhost:3000/firmadoDigital/";
const URLSERVERdetail = "http://localhost:3000/pdfs/";

const URLSERVERretrieve = "http://localhost:3000/retrieve/";

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

var thisDocName = "";
var userId = null;
var initialTimestampName = "";

var URLString = window.location.href.split('?');
var datosURL = URLString[1].split('&');
var idHTML = datosURL[0].replace("id=","");
var pageHTML = datosURL[1].replace("page=","");

async function returnDataOriginal() {

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    console.log("return data");
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

async function retrievePDF() {

    console.log("retrieve pdf: " + URLSERVERretrieve + thisDocName + "/" + userId + "/" + initialTimestampName + "/" + "STAMP");
    return fetch(URLSERVERretrieve + thisDocName + "/" + userId + "/" + initialTimestampName + "/" + "STAMP", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => { 
        console.log(response);

        return response.blob().then((data) => {
                    //console.log(data);
                    return generateWindow(data);
                }).catch((err) => {
                    console.log(err);
                }) 

    });
    

}

//pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, nameUser, userId
function appendDataOriginal(data){
    for(let i=0;i<data.length;i++){
        console.log(data[i]);

        thisDocName = data[i].DocName;                     

        var initialTimestampNameAux = data[0].initialUploadTimestamp.slice(0, 19).replace('T', ' ');
        var initialTimestampNameAux2 = initialTimestampNameAux.replace(" ","_").replaceAll(":","-");
        initialTimestampName = initialTimestampNameAux2.replaceAll("-","_");

    }
    console.log("finalizado generacion de ventana");
}

async function returnDataStamp() {
    const URLSERVERdetail = "http://localhost:3000/pdfStamp/";

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    //console.log("return data");
    return fetch(URLSERVERdetail + idHTML)
        .then((response) => { 
            return response.json().then((data) => {
                return appendDataStamp(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

function appendDataStamp(data){

    var buttons = document.getElementById("button-container");

    var buttonSub = document.createElement("button");
    buttonSub.innerHTML = "Submit";
    buttonSub.id = "submit";
    buttonSub.onclick = sendData;
    buttons.appendChild(buttonSub);

    var buttonCan = document.createElement("button");
    buttonCan.innerHTML = "Cancel";
    buttonCan.onclick = onbuttonclicked;
    buttons.appendChild(buttonCan);

    var con=document.getElementById("main-container");
    if(data.length !== 0){
        
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
            f.textContent="Stamp User Name: " + data[i].nameUser                      
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

            var k=document.createElement("div");
            var stampTimestampNameAux = data[0].stampTimestamp.slice(0, 19).replace('T', ' ');
            k.textContent="Stamp DateTime: " + stampTimestampNameAux;                      
            con.appendChild(k);

            document.getElementById("submit").disabled = false;

            if(data[0].stampUserId !== datosUsuario.id || data[0].atrexists === 0){
                document.getElementById("submit").disabled = true;
            }
        }
    }else{
        console.log("No hay documento estampado");

        var j=document.createElement("div");
        j.textContent="No hay documento estampado";
        con.appendChild(j);

        document.getElementById("submit").disabled = true;
    }
    //console.log("finalizado generacion de ventana");
}

function onbuttonclicked() {
  //"location.href='table_pag.html?page=' + pageHTML";
  if (onbuttonclicked) {
    window.location.href = "table.html?page=" + pageHTML;
  }
}

function generateWindow(response){
    console.log(response);

    const fileURL = URL.createObjectURL(response);
    console.log(fileURL);
    window.open(fileURL);

}

function checkUserHosting(){

    //var idHTML = null;
    //var datosURL = window.location.href.split('?');
    //idHTML = datosURL[1].replace("id=","");

    if(idHTML === null || idHTML === ""){
        window.location.href = "table.html?page=1";
    }else{

        returnDataOriginal().then(() => {
            returnDataStamp();
        }).then(() => {
            retrievePDF();
        })
    }
    
}

checkUserHosting();

async function sendData(){

    const fdUser = {
        fdUserId: datosUsuario.id,
    }

    return fetch(URLSERVERFirmadoDigital + idHTML, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fdUser)
    })
    .then((response) => { 
        console.log(response);

        if(response.status === 400 || response.status === 500){
            alert("No se ha podido hacer firmado digital");
            window.location.href = "table.html?page=" + pageHTML;
        }else{

            alert("Se ha podido hacer firmado digital");
            window.location.href = "table.html?page=" + pageHTML;
        } 

    });

}