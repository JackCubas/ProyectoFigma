const URLSERVERgetall = "http://localhost:3000/users";

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

if(datosUsuario.rolUser != "ADMIN"){
    window.location.href = "../404.html";
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
  console.log(data);
  const table = document.getElementById("mytable").getElementsByTagName('tbody')[0];
  if(data !== null && data.length > 0){
    for (let i = 0; i < data.length; i++) {
      console.log(data[i]);

      const newRow = table.insertRow();
      const cell1 = newRow.insertCell(0);
      const cell2 = newRow.insertCell(1);
      cell1.textContent = data[i].nameUser;
      
      const butID = data[i].id;

      const button = document.createElement('button');
      button.id = "testbutton" + butID;
      button.textContent = "Click Me";
      button.addEventListener('click', doSmth);
      cell2.appendChild(button);

      const buttonDetail = document.createElement('button');
      buttonDetail.id = "detailbutton" + butID;
      buttonDetail.textContent = "Detail";
      buttonDetail.addEventListener('click', detail);
      cell2.appendChild(buttonDetail);

      const buttonEdit = document.createElement('button');
      buttonEdit.id = "editbutton" + butID;
      buttonEdit.textContent = "Edit";
      buttonEdit.addEventListener('click', edit);
      cell2.appendChild(buttonEdit);

      const buttonDel = document.createElement('button');
      buttonDel.id = "delbutton" + butID;
      buttonDel.textContent = "Delete";
      buttonDel.addEventListener('click', del);
      cell2.appendChild(buttonDel);

      const buttonStamp = document.createElement('button');
      buttonStamp.id = "stampbutton" + butID;
      buttonStamp.textContent = "Stamp";
      buttonStamp.addEventListener('click', stamp);
      cell2.appendChild(buttonStamp);
    }
  }else{
    const emptyRow = table.insertRow();
    const cellempty = emptyRow.insertCell(0);
    cellempty.textContent = "No users have been found"
  }

}

function doSmth(event) {
  var idDetailString = event.target.id;
  const substringToRemove = "testbutton";
  const idDetail = idDetailString.replace(substringToRemove, '');

  alert("ID: " + idDetail);
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

function stamp(event){
  console.log("STAMP");
  //alert("DELETE " + event.target.id);

  var idStampString = event.target.id;
  const substringToRemove = "stampbutton";
  const idStamp = idStampString.replace(substringToRemove, '');

  //alert("DEL " + idDel);

  window.location.href = "stamp.html?id=" + idStamp;
}


checkUserHosting();


