const URLSERVERCreate = "http://localhost:3000/users";

//create.html?prodId=34&price=34&quantity=34
//?prodId=34&price=34&quantity=34
var datosURL = window.location.href;

if(datosURL.includes("?")){
    //alert(datosURL);
    var datosURLSplit = window.location.href.split('?');
    var datosURLNuevo = datosURLSplit[0];

    //window.history.replaceState( {} , '', datosURLNuevo);
    window.location.href = datosURLNuevo;
}

function checkUserHosting() {
    var buttons = document.getElementById("button-container");

    var buttonSub = document.createElement("button");
    buttonSub.innerHTML = "Submit";
    buttonSub.onclick = sendData;
    buttons.appendChild(buttonSub);
}

async function sendData(){

    //event.preventDefault();

    //const emailPattern = /^\S+@\S+\.\S+$/
    const emailPattern = /^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/;
    const dniPattern = /^[0-9]{8}[A-Z]{1}$/;

    var nameUser = document.getElementById("nameUser").value;
    var emailUser = document.getElementById("emailUser").value;
    var passUser = document.getElementById("passUser").value;
    var passUserRepeat = document.getElementById("passUserRepeat").value;
    var dniUser = document.getElementById("dniUser").value;
    var rolUser = document.getElementById("rolUser").value;

    if(nameUser === "" || emailUser === "" || passUser === "" || passUserRepeat === "" || dniUser === ""){
        alert("Todos los campos son obligatorios.");

    }else if (passUser !== passUserRepeat) {
        alert('Ambos pass necesitan ser iguales');

        document.getElementById("passUser").focus();
        document.getElementById("passUserRepeat").focus();

        document.getElementById("passUser").value = "";
        document.getElementById("passUserRepeat").value = "";

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
                dniUser: dniCrypt,
                rolUser: rolUser
            }

            /*const apiCall = await fetch(URLSERVERCreate, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(nuevoUsers)
            })

            const result = await apiCall.json();
            console.log(result);

            alert("SignUp hecho correctamente");

            window.location.href = "../index.html";*/

            return fetch(URLSERVERCreate, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(nuevoUsers)
            })
            .then((response) => { 
                console.log(response);

                if(response.status === 400 || response.status === 500){
                    alert("No se ha podido crear usuario");
                    window.location.href = "../index.html";
                }else{
                    console.log(response);
                    alert("SignUp hecho correctamente");
                    window.location.href = "../index.html"
                    
                } 

            });
        }
   
}
checkUserHosting();