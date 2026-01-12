const URLSERVERdetail = "http://localhost:3000/users/";

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

if(datosUsuario.rolUser != "ADMIN"){
    window.location.href = "../404.html";
}

var URLString = window.location.href.split('?');
var datosURL = URLString[1].split('&');
var idHTML = datosURL[0].replace("id=","");
var pageHTML = datosURL[1].replace("page=","");

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

        var j=document.createElement("div")
        var estadoATR = "No Existe";
        if(data[i].atrexists === 0){
            estadoATR = "No Existe";
        }
        if(data[i].atrexists === 1){
            estadoATR = "Existe";
        }
        j.textContent="ATR: " + estadoATR                      
        con.appendChild(j);
    }

    var buttons = document.getElementById("button-container");
    var button = document.createElement("button");
    button.innerHTML = "Cancel";
    button.onclick = onbuttonclicked;
    buttons.appendChild(button);   
}

function onbuttonclicked() {
  //"location.href='table_pag.html?page=' + pageHTML";
  if (onbuttonclicked) {
    window.location.href = "table_pag.html?page=" + pageHTML;
  }
}    


checkUserHosting();