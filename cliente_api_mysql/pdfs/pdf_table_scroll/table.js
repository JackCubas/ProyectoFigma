var URLSERVERgetall = ""; //"http://localhost:3000/pdfs";

var datosUsuario = null;

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
     datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

if((datosUsuario.rolUser === "ADMIN") || (datosUsuario.rolUser === "FIRMA")){
  URLSERVERgetall = "http://localhost:3000/pdfs"
}

if((datosUsuario.rolUser === "CLIENT")){
  var URLSERVERgetallAux = "http://localhost:3000/pdfsByUser/"
  URLSERVERgetall = URLSERVERgetallAux + datosUsuario.id
}

function checkUserHosting() {
    return fetch(URLSERVERgetall)
        .then((response) => { 
            return response.json().then((data) => {
                //return appendData(data);
                return buildTable(data);
            }).catch((err) => {
                console.log(err);
                return buildTable(null);
            }) 
        });

}

function buildTable(data) {

  const main = document.getElementById("main-container");

  console.log(data);
  const table = document.getElementById("mytable").getElementsByTagName('tbody')[0];
  if(data !== null && data.length > 0){
    for (let i = 0; i < data.length; i++) {
      console.log(data[i]);

      const newRow = table.insertRow();
      const cell1 = newRow.insertCell(0);
      const cell2 = newRow.insertCell(1);
      const cell3 = newRow.insertCell(2);
      cell1.textContent = data[i].DocName;
      cell2.textContent = data[i].nameUser;
      
      const butID = data[i].pdfId;

      const buttonDetail = document.createElement('button');
      buttonDetail.id = "detailbutton" + butID;
      buttonDetail.textContent = "Detail";
      buttonDetail.addEventListener('click', detail);
      cell3.appendChild(buttonDetail);

      const buttonEdit = document.createElement('button');
      buttonEdit.id = "editbutton" + butID;
      buttonEdit.textContent = "Edit";
      buttonEdit.addEventListener('click', edit);
      cell3.appendChild(buttonEdit);

      const buttonDel = document.createElement('button');
      buttonDel.id = "delbutton" + butID;
      buttonDel.textContent = "Delete";
      buttonDel.addEventListener('click', del);
      cell3.appendChild(buttonDel);

      if((datosUsuario.rolUser === "ADMIN") || (datosUsuario.rolUser === "FIRMA")){
        const buttonSign = document.createElement('button');
        buttonSign.id = "signbutton" + butID;
        buttonSign.textContent = "Sign";
        buttonSign.addEventListener('click', sign);
        cell3.appendChild(buttonSign);

        const buttonStamp = document.createElement('button');
        buttonStamp.id = "stampbutton" + butID;
        buttonStamp.textContent = "Stamp";
        buttonStamp.addEventListener('click', stamp);
        cell3.appendChild(buttonStamp);

        const buttonFD = document.createElement('button');
        buttonFD.id = "FDbutton" + butID;
        buttonFD.textContent = "FD";
        buttonFD.addEventListener('click', firmadoDigital);
        cell3.appendChild(buttonFD);
      }
    }
  }else{
    //const emptyRow = table.insertRow();
    //const cellempty = emptyRow.insertCell(0);
    //cellempty.textContent = "No documents have been found"

    var newParagraph = document.createElement('p');
    newParagraph.textContent = 'No documents have been found';
    main.append(newParagraph);
  }
}

function detail(event){
  console.log("DETAIL");
  //console.log(event);

  var idDetailString = event.target.id;
  const substringToRemove = "detailbutton";
  const idDetail = idDetailString.replace(substringToRemove, '');

  //alert("DETAIL " + idDetail);

  window.location.href = "detail.html?id=" + idDetail;
}

function edit(event){
  console.log("EDIT");

  var idEditString = event.target.id;
  const substringToRemove = "editbutton";
  const idEdit = idEditString.replace(substringToRemove, '');

  //alert("EDIT " + idEdit);

  window.location.href = "modify.html?id=" + idEdit;
}

function del(event){
  console.log("DELETE");
  //alert("DELETE " + event.target.id);

  var idDelString = event.target.id;
  const substringToRemove = "delbutton";
  const idDel = idDelString.replace(substringToRemove, '');

  //alert("DEL " + idDel);

  window.location.href = "delete.html?id=" + idDel;
}

function sign(event) {
  var idSignString = event.target.id;
  const substringToRemove = "signbutton";
  const idSign = idSignString.replace(substringToRemove, '');

  //alert("Sign: " + idSign);

  window.location.href = "sign.html?id=" + idSign;
}

function stamp(event) {
  var idStampString = event.target.id;
  const substringToRemove = "stampbutton";
  const idStamp = idStampString.replace(substringToRemove, '');

  window.location.href = "stamp.html?id=" + idStamp;
}

function firmadoDigital(event) {
  var idFirmadoDigital = event.target.id;
  const substringToRemove = "FDbutton";
  const idFD = idFirmadoDigital.replace(substringToRemove, '');

  alert("Firmado digital: " + idFD);

  //window.location.href = "firmadoDigital.html?id=" + idFD;
}


checkUserHosting();