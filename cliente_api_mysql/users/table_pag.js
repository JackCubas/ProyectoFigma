const URLSERVERgetall = "http://localhost:3000/users_pag";

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

if(datosUsuario.rolUser != "ADMIN"){
    window.location.href = "../404.html";
}

var datosURL = window.location.href.split('?');
var page = datosURL[1].replace("page=","");

console.log(datosURL);
console.log("page " + page);

function checkUserHosting() {

    return fetch(URLSERVERgetall + '?page=' + page)
        .then((response) => { 
            return response.json().then((data) => {
                //return appendData(data);
                return buildVentana(data);
            }).catch((err) => {
                console.log(err);
                return buildVentana(null);
            }) 
        });

}

function buildVentana(data){
  console.log(data);
  var currentPageNum = buildPaginacion(data);
  buildTable(data, currentPageNum);

}


function buildPaginacion(data){
  const linkPrev  = document.getElementById("pagePrev");
  const linkNext  = document.getElementById("pageNext");

  pageNum = parseInt(page);
  pageNumPrev = pageNum - 1;
  pageNumNext = pageNum + 1;

  console.log("pageNum " + pageNum);
  console.log("prev " + pageNumPrev);
  console.log("next" + pageNumNext);
  
  if(pageNumPrev == 0){
    linkPrev.href = '#';
  }else{
    linkPrev.href="table_pag.html?page=" + pageNumPrev;
  }

  if(data != null && data.length < 10){
    linkNext.href = '#';
  }else{
    linkNext.href="table_pag.html?page=" + pageNumNext;
  }
  
  return pageNum;
}

function buildTable(data, currentPageNum) {

  const main = document.getElementById("main-container");
  /*var newPage = currentPageNum;

  if(data !== null && data.length > 0 && data.length === 10){
    newPage = currentPageNum + 1;
  }*/

  var a = document.createElement('a');
  var linkText = document.createTextNode("Create");
  a.appendChild(linkText);
  a.title = "Create";
  a.href = 'create.html?page=' + currentPageNum;
  a.className = 'button';
  main.appendChild(a);

  const table = document.getElementById("mytable").getElementsByTagName('tbody')[0];
  if(data !== null && data.length > 0){
    for (let i = 0; i < data.length; i++) {
      console.log(data[i]);

      const newRow = table.insertRow();
      const cell1 = newRow.insertCell(0);
      const cell2 = newRow.insertCell(1);
      const cell3 = newRow.insertCell(2);
      cell1.textContent = data[i].nameUser;
      cell2.textContent = data[i].rolUser;

      const butID = data[i].id;

      const buttonDetail = document.createElement('button');
      buttonDetail.id = "detailbutton" + butID + "-" + currentPageNum + "-" + data.length;
      buttonDetail.textContent = "Detail";
      buttonDetail.addEventListener('click', detail);
      cell3.appendChild(buttonDetail);

      const buttonEdit = document.createElement('button');
      buttonEdit.id = "editbutton" + butID + "-" + currentPageNum + "-" + data.length;
      buttonEdit.textContent = "Edit";
      buttonEdit.addEventListener('click', edit);
      cell3.appendChild(buttonEdit);

      const buttonDel = document.createElement('button');
      buttonDel.id = "delbutton" + butID + "-" + currentPageNum + "-" + data.length;
      buttonDel.textContent = "Delete";
      buttonDel.addEventListener('click', del);
      cell3.appendChild(buttonDel);

      const buttonStamp = document.createElement('button');
      buttonStamp.id = "stampbutton" + butID + "-" + currentPageNum + "-" + data.length;
      buttonStamp.textContent = "Stamp";
      buttonStamp.addEventListener('click', stamp);
      cell3.appendChild(buttonStamp);
    }
  }else{
    //const emptyRow = table.insertRow();
    //const cellempty = emptyRow.insertCell(0);
    //cellempty.textContent = "No users have been found"

    var newParagraph = document.createElement('p');
    newParagraph.textContent = 'No users have been found';
    main.append(newParagraph);
  }
}

function detail(event){
  console.log("DETAIL");
  //console.log(event);

  var idDetailString = event.target.id;
  const substringToRemove = "detailbutton";
  var datosDetailString = idDetailString.replace(substringToRemove, '');
  var datosDetail = datosDetailString.split('-');

  //alert("DETAIL " + datosDetail[0] + " " + datosDetail[1] + " " + datosDetail[2]);

  window.location.href = "detail.html?id=" + datosDetail[0] + "&page=" + datosDetail[1];
}

function edit(event){
  console.log("EDIT");

  var idEditString = event.target.id;
  const substringToRemove = "editbutton";
  var datosEditString = idEditString.replace(substringToRemove, '');
  var datosEdit = datosEditString.split('-');

  //alert("EDIT " + datosEdit[0] + " " + datosEdit[1] + " " + datosEdit[2]);

  window.location.href = "modify.html?id=" + datosEdit[0] + "&page=" + datosEdit[1];
}

function del(event){
  console.log("DELETE");
  //alert("DELETE " + event.target.id);

  var idDelString = event.target.id;
  const substringToRemove = "delbutton";
  var datosDelString = idDelString.replace(substringToRemove, '');
  var datosDel = datosDelString.split('-');

  //alert("DEL " + datosDel[0] + " " + datosDel[1] + " " + datosDel[2]);

  if(!isNaN(datosDel[1]) && !isNaN(datosDel[2])){

    var currentPageNum = parseInt(datosDel[1]);
    var numUsers = parseInt(datosDel[2]);

    var newPageNum = currentPageNum;

    if(numUsers === 1 && currentPageNum > 1){
      newPageNum = currentPageNum - 1;
    }

    //alert("nums: " + currentPageNum + " " + newPageNum + " " + numUsers);

  }

  window.location.href = "delete.html?id=" + datosDel[0] + "&page=" + currentPageNum + "&new=" + newPageNum;
}

function stamp(event){
  console.log("STAMP");
  //alert("DELETE " + event.target.id);

  var idStampString = event.target.id;
  const substringToRemove = "stampbutton";
  var datosStampString = idStampString.replace(substringToRemove, '');
  var datosStamp = datosStampString.split('-');

  //alert("STAMP " + datosStamp[0] + " " + datosStamp[1] + " " + datosStamp[2]);

  window.location.href = "stamp.html?id=" + datosStamp[0] + "&page=" + datosStamp[1];
}


checkUserHosting();


