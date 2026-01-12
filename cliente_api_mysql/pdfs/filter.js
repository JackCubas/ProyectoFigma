const URLSERVERpdfcriteria = "http://localhost:3000/pdfsByCriteria";
var emailUser = "";
var nameUser = "";
var docName = "";
var estado = "";

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

if((datosUsuario.rolUser === "CLIENT")){
  window.location.href = "../404.html";
}

/*var datosURL = window.location.href;

if(datosURL.includes("?") || datosURL.includes("&") || datosURL.includes("=")){
    window.location.href = "../index.html";
}*/

async function sendData(){

    emailUser = document.getElementById("emailUser").value;
    nameUser = document.getElementById("nameUser").value;
    docName = document.getElementById("docName").value;
    estado = document.getElementById("estado").value;

    //?color1=red&color2=blue

    return fetch(URLSERVERpdfcriteria + '?emailUser=' + emailUser + '&nameUser=' + nameUser + '&docName=' + docName + '&estado=' + estado)
    .then((response) => { 
            return response.json().then((data) => {
                //return appendData(data);
                return appendData(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });    
}

function appendData(data){
    console.log(data);

    let parent = document.getElementById("mytable").getElementsByTagName('tbody')[0];
    empty(parent);

    const mainParent = document.getElementById("main-container");
    empty(mainParent);

    const table = document.getElementById("mytable").getElementsByTagName('tbody')[0];

    const main = document.getElementById("main-container");

    if(data !== null && data.length > 0){

        for(let i=0;i<data.length;i++){
            console.log(data[i]);

            const newRow = table.insertRow();

            const cell1 = newRow.insertCell(0);
            const cell2 = newRow.insertCell(1);
            const cell3 = newRow.insertCell(2);
            const cell4 = newRow.insertCell(3);

            cell1.innerText = data[i].DocName;
            cell2.innerText = data[i].nameUser;
            cell3.innerText = data[i].estado;

            const butID = data[i].pdfId;

            const buttonDetail = document.createElement('button');
            buttonDetail.id = "detailbutton" + butID;
            buttonDetail.textContent = "Detail";
            buttonDetail.addEventListener('click', detail);
            cell4.appendChild(buttonDetail);

            const buttonEdit = document.createElement('button');
            buttonEdit.id = "editbutton" + butID;
            buttonEdit.textContent = "Edit";
            buttonEdit.addEventListener('click', edit);
            cell4.appendChild(buttonEdit);

            const buttonDel = document.createElement('button');
            buttonDel.id = "delbutton" + butID;
            buttonDel.textContent = "Delete";
            buttonDel.addEventListener('click', del);
            cell4.appendChild(buttonDel);

            const buttonSign = document.createElement('button');
            buttonSign.id = "signbutton" + butID;
            buttonSign.textContent = "Sign";
            buttonSign.addEventListener('click', sign);
            cell4.appendChild(buttonSign);

            const buttonStamp = document.createElement('button');
            buttonStamp.id = "stampbutton" + butID;
            buttonStamp.textContent = "Stamp";
            buttonStamp.addEventListener('click', stamp);
            cell4.appendChild(buttonStamp);

            const buttonFD = document.createElement('button');
            buttonFD.id = "FDbutton" + butID;
            buttonFD.textContent = "FD";
            buttonFD.addEventListener('click', firmadoDigital);
            cell4.appendChild(buttonFD);
        
        }
    }else{
        
        var newParagraph = document.createElement('p');
        newParagraph.textContent = 'No documents have been found';
        main.append(newParagraph);
    }

    var form = document.getElementById("form"); 
    function handleForm(event) {     
        event.preventDefault(); 
    }  
    form.addEventListener('submit', handleForm);
    
    console.log("finalizado generacion de ventana");
    //alert("final");
}


function checkUserHosting() {
    return fetch(URLSERVERpdfcriteria + '?emailUser=' + emailUser + '&nameUser=' + nameUser + '&docName=' + docName + '&estado=' + estado)
        .then((response) => { 
            return response.json().then((data) => {
                //return appendData(data);
                return appendData(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}


function detail(event){
  console.log("DETAIL");
  //console.log(event);

  var idDetailString = event.target.id;
  const substringToRemove = "detailbutton";
  const idDetail = idDetailString.replace(substringToRemove, '');

  //alert("DETAIL " + idDetail);

  window.location.href = "detail.html?id=" + idDetail + "&page=1";
}

function edit(event){
  console.log("EDIT");

  var idEditString = event.target.id;
  const substringToRemove = "editbutton";
  const idEdit = idEditString.replace(substringToRemove, '');

  //alert("EDIT " + idEdit);

  window.location.href = "modify.html?id=" + idEdit + "&page=1";
}

function del(event){
  console.log("DELETE");
  //alert("DELETE " + event.target.id);

  var idDelString = event.target.id;
  const substringToRemove = "delbutton";
  const idDel = idDelString.replace(substringToRemove, '');

  //alert("DEL " + idDel);

  window.location.href = "delete.html?id=" + idDel + "&page=1&new=1";
}

function sign(event) {
  var idSignString = event.target.id;
  const substringToRemove = "signbutton";
  const idSign = idSignString.replace(substringToRemove, '');

  //alert("Sign: " + idSign);

  window.location.href = "sign.html?id=" + idSign + "&page=1";
}

function stamp(event) {
  var idStampString = event.target.id;
  const substringToRemove = "stampbutton";
  const idStamp = idStampString.replace(substringToRemove, '');

  window.location.href = "stamp.html?id=" + idStamp + "&page=1";
}

function firmadoDigital(event) {
  var idFirmadoDigital = event.target.id;
  const substringToRemove = "FDbutton";
  const idFD = idFirmadoDigital.replace(substringToRemove, '');

  alert("Firmado digital: " + idFD);

  //window.location.href = "firmadoDigital.html?id=" + idFD;
}


checkUserHosting();

function empty(element) {
  while(element.firstElementChild) {
     element.firstElementChild.remove();
  }
}

/*

var emailUser = req.query.emailUser || "";
  var nameUser = req.query.nameUser || "";
  var docName = req.query.docName || "";
  var estado = req.query.estado || "";

*/