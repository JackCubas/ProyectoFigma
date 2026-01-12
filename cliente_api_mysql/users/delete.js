
const URLSERVERdetail = "http://localhost:3000/users/";
const URLSERVERDelete = "http://localhost:3000/users/";

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

    return fetch(URLSERVERdetail + idHTML)
        .then((response) => { 
            return response.json().then((data) => {
                return appendData(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

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


function appendData(data){
    var con=document.getElementById("main-container")
    for(let i=0;i<data.length;i++){
        console.log(data[i]);
        var d=document.createElement("div")
        d.textContent="Name: " + data[i].nameUser                      
        con.appendChild(d);

        var e=document.createElement("div")
        var decryptedEmail = CryptoJS.AES.decrypt(data[i].emailUser, "firma_app");
        var decryptedEmailString = decryptedEmail.toString(CryptoJS.enc.Utf8);
        e.textContent="Email: " + decryptedEmailString                      
        con.appendChild(e);

        var f=document.createElement("div")
        var decryptedPass = CryptoJS.AES.decrypt(data[i].passUser, "firma_app");
        var decryptedPassString = decryptedPass.toString(CryptoJS.enc.Utf8);
        f.textContent="Pass: " + decryptedPassString                      
        con.appendChild(f);

        var h=document.createElement("div")
        h.textContent="Rol: " + data[i].rolUser                      
        con.appendChild(h);

        var g=document.createElement("div")
        var decryptedDNI = CryptoJS.AES.decrypt(data[i].dniUser, "firma_app");
        var decryptedDNIString = decryptedDNI.toString(CryptoJS.enc.Utf8);
        g.textContent="DNI: " + decryptedDNIString                      
        con.appendChild(g);
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
    window.location.href = "table_pag.html?page=" + pageHTML;
  }
}

async function sendData(){

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    const response = await fetch(URLSERVERDelete + idHTML, {
        method: "DELETE"
    })

    //if(!response.ok){
    //    alert("No se ha podido borrar usuario");
    //    window.location.href = "table_pag.html?page=" + pageHTML;

    //alert('status:', response.status);
    
    //}else{

    const result = await response.json();
    console.log(result);

    if(result.status === 400 || result.status === 500 || result.hasOwnProperty("error")){
        alert("No se ha podido borrar usuario");
        window.location.href = "table_pag.html?page=" + pageHTML;
    }else{
        //console.log(response);
        alert("Usuario borrado correctamente");
        window.location.href = "table_pag.html?page=" + newHTML;        
    }
    //} 

}

checkUserHosting();
