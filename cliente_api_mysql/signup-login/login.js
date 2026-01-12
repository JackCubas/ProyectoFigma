const URLSERVERlogin = "http://localhost:3000/login";

var datosURL = window.location.href;

if(datosURL.includes("?") || datosURL.includes("&") || datosURL.includes("=")){
    window.location.href = "../index.html";
}

console.log("Entrando en el login");

function checkUserHosting() {
    var buttons = document.getElementById("button-container");

    var buttonSub = document.createElement("button");
    buttonSub.innerHTML = "Submit";
    buttonSub.onclick = sendData;
    buttons.appendChild(buttonSub);
}

async function sendData(){

    const emailPattern = /^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/;

    var emailUser = document.getElementById("emailUser").value;
    var passUser = document.getElementById("passUser").value;

     if(emailUser === "" || passUser === ""){
        alert("Todos los campos son obligatorios.");

    }else if(!emailPattern.test(emailUser)){
        alert('No es un correo electronico adecuado');

        document.getElementById("emailUser").focus();
        document.getElementById("emailUser").value = "";
    
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

    }else{

        var emailCrypt = CryptoJS.AES.encrypt(emailUser, "firma_app").toString();
        var passCrypt = CryptoJS.AES.encrypt(passUser, "firma_app").toString();

        //?color1=red&color2=blue

        //const apiCall = await fetch(URLSERVERlogin + '?email=' + emailUser + '&pass=' + passUser)
        //const result = await apiCall.json();
        //console.log(apiCall);
        //console.log(result);
        //alert("response");

        const loginUsers = {
            userEmail: emailCrypt,
            userPass: passCrypt,
        }
        
        return fetch(URLSERVERlogin, {
            //method: "GET",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(loginUsers)
        })
        .then((response) => {

            if(!response.ok){
                alert("No se ha podido encontrar usuario");
            }else{

                if(response.status === 400 || response.status === 500 || response.status === 204){
                    alert("No se ha podido encontrar usuario");
                        //window.location.href = "../index.html";
                }else{
                    return response.json().then((data) => {
                        return checkData(data);
                    }).catch((err) => {
                        console.log(err);
                    })           
                }
            } 

        })
        .catch((error) => {
        console.error('Error:', error);
        alert("Server is down");   
        });
    
    }
}

function checkData(data){
    var userDatos = data.user[0];
    console.log(userDatos)
    if(userDatos == "FALSE"){
        alert("FALSE");
        console.log("Usuario no existe");
        localStorage.setItem("usuario", "FALSE");
    }else{
        if(userDatos.rolUser == "ADMIN"){
            alert("ADMIN");
            console.log("Usuario ADMIN");
            localStorage.setItem("usuario", JSON.stringify(userDatos));
        }
        if(userDatos.rolUser == "CLIENT"){
            alert("CLIENT");
            console.log("Usuario CLIENT");
            localStorage.setItem("usuario", JSON.stringify(userDatos));
        }
        if(userDatos.rolUser == "FIRMA"){
            alert("FIRMA");
            console.log("Usuario FIRMA");
            localStorage.setItem("usuario", JSON.stringify(userDatos));
        }
    }

    console.log(JSON.parse(localStorage.getItem("usuario")));
    alert("response"); 
    //localStorage.clear();
    window.location.href = "../index.html";
}

checkUserHosting();
