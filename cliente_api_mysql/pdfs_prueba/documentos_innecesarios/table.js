const URLSERVERgetall = "http://localhost:3000/pdfs";

function checkUserHosting() {
    return fetch(URLSERVERgetall)
        .then((response) => { 
            return response.json().then((data) => {
                //return appendData(data);
                return buildTable(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

function buildTable(data) {
  console.log(data);
  const table = document.getElementById("mytable").getElementsByTagName('tbody')[0];
  for (let i = 0; i < data.length; i++) {
    console.log(data[i]);

    const newRow = table.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    cell1.textContent = data[i].DocName;
    cell2.textContent = data[i].nameUser;
    
    const butID = data[i].pdfId;

    const button = document.createElement('button');
    button.id = "testbutton" + butID;
    button.textContent = "Click Me";
    button.addEventListener('click', doSmth);
    cell3.appendChild(button);

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

  alert("DETAIL " + idDetail);

  //window.location.href = "detail.html?id=" + idDetail;
}

function edit(event){
  console.log("EDIT");

  var idEditString = event.target.id;
  const substringToRemove = "editbutton";
  const idEdit = idEditString.replace(substringToRemove, '');

  alert("EDIT " + idEdit);

  //window.location.href = "modify.html?id=" + idEdit;
}

function del(event){
  console.log("DELETE");
  //alert("DELETE " + event.target.id);

  var idDelString = event.target.id;
  const substringToRemove = "delbutton";
  const idDel = idDelString.replace(substringToRemove, '');

  alert("DEL " + idDel);

  //window.location.href = "delete.html?id=" + idDel;
}


checkUserHosting();