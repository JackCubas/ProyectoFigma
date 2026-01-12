const URLSERVERCreate = "http://localhost:3000/users";
const URLSERVERCount = "http://localhost:3000/countUsers";

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

if(datosUsuario.rolUser != "ADMIN"){
    window.location.href = "../404.html";
}

var datosURL = window.location.href;

/*if(datosURL.includes("?") || datosURL.includes("&") || datosURL.includes("=")){
    window.location.href = "table_pag.html?page=1";
}*/

var pageHTML = "1";
var newHTML = 1;

var datosURL = window.location.href.split('?');
var pageHTML = datosURL[1].replace("page=","");

function checkUserHosting() {

    return fetch(URLSERVERCount)
        .then((response) => { 
            return response.json().then((data) => {
                return appendData(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

function appendData(data){
    //console.log("Numero total de usuarios: ");
    //console.log(data);
    var totalUsuarios = data[0].total;
    var usuariosDeci = totalUsuarios/10;

    console.log("Numero total de usuarios: " + totalUsuarios);

    if(!Number.isInteger(usuariosDeci)){
        //pageHTML = Math.ceil(totalUsuarios/10);
        newHTML = Math.ceil(totalUsuarios/10);
    }

    if(Number.isInteger(usuariosDeci) && usuariosDeci > 1){
        //pageHTML = Math.ceil(totalUsuarios/10);
        newHTML = Math.ceil(totalUsuarios/10) + 1;
    }

    console.log("Current page: " + pageHTML);
    console.log("New page: " + newHTML);

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

    //event.preventDefault();

    //returnToTable = true;
    const emailPattern = /^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/;
    const dniPattern = /^[0-9]{8}[A-Z]{1}$/;

    var nameUser = document.getElementById("nameUser").value;
    var emailUser = document.getElementById("emailUser").value;
    var passUser = document.getElementById("passUser").value;
    var rolUser = document.getElementById("rolUser").value;
    var dniUser = document.getElementById("dniUser").value;

    if(nameUser === "" || emailUser === "" || passUser === "" || dniUser === ""){
        alert("Todos los campos son obligatorios.");

    }else if(!emailPattern.test(emailUser)){
        alert('No es un correo electronico adecuado');

        document.getElementById("emailUser").focus();
        document.getElementById("emailUser").value = "";

    }else if (nameUser.length>50){
        alert("El nombre debe tener menos de 51 caracteres.");

		document.getElementById("nameUser").focus();
        document.getElementById("nameUser").value = "";

    }else if (nameUser.length<2){ 
        alert("El nombre debe tener al menos 2 caracteres.");

		document.getElementById("nameUser").focus();
        document.getElementById("nameUser").value = "";

    }else if (passUser.length>50){
        alert("El pass debe tener menos de 51 caracteres.");

		document.getElementById("passUser").focus();
        document.getElementById("passUserRepeat").focus();

        document.getElementById("passUser").value = "";
        document.getElementById("passUserRepeat").value = "";

    }else if (passUser.length<6){ 
        alert("El pass debe tener al menos 6 caracteres.");

		document.getElementById("passUser").focus();
        document.getElementById("passUserRepeat").focus();

        document.getElementById("passUser").value = "";
        document.getElementById("passUserRepeat").value = "";   

    }else if(!dniPattern.test(dniUser)){
        alert('No es un dni adecuado');

        document.getElementById("dniUser").focus();
        document.getElementById("dniUser").value = "";

    }else{

        var emailCrypt = CryptoJS.AES.encrypt(emailUser, "firma_app").toString();
        var passCrypt = CryptoJS.AES.encrypt(passUser, "firma_app").toString();
        var dniCrypt = CryptoJS.AES.encrypt(dniUser, "firma_app").toString();

        const nuevoUsers = {
            nameUser: nameUser,
            emailUser: emailCrypt,
            passUser: passCrypt,
            rolUser: rolUser,
            dniUser: dniCrypt
        }

        const apiCall = await fetch(URLSERVERCreate, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(nuevoUsers)
        })

        if(!apiCall.ok){
            alert("No se ha podido crear usuario");
            window.location.href = "table_pag.html?page=" + pageHTML;
        }else{        

            const result = await apiCall.json();
            console.log(result);

            if(result.status === 400 || result.status === 500 || result.hasOwnProperty("error")){
                alert("No se ha podido crear usuario");
                window.location.href = "table_pag.html?page=" + pageHTML; 
            }else{
                //console.log(response);
                alert("Usuario creado correctamente");
                window.location.href = "table_pag.html?page=" + newHTML;        
            }
        } 
    }
}

 checkUserHosting()
