const URLSERVERlogin = "http://localhost:3000/users/login";

var datosURL = window.location.href;

if(datosURL.includes("?") || datosURL.includes("&") || datosURL.includes("=")){
    window.location.href = "../index.html";
}

console.log("Entrando en el login");

function sendData(){


    var emailUser = document.getElementById("emailUser").value;
    var passUser = document.getElementById("passUser").value;

    const loginUsers = {
        emailUser: emailUser,
        passUser: passUser
    }

    return fetch(URLSERVERlogin, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(loginUsers)
        })
        .then((response) => {
            console.log(response);
            alert("response"); 
            return response.json().then((data) => {
                console.log(data);
                alert("data");
                return checkData(data);
        }).catch((err) => {
            console.log(err);
        }) 
    });

}

function checkData(data){
    var userDatos = data;
    if(userDatos == "FALSE"){
        alert("FALSE");
        console.log("Usuario no existe");
        localStorage.setItem("usuario", "FALSE");
    }else{
        if(userDatos.rolUser == "ADMIN"){
            alert("ADMIN");
            console.log("Usuario ADMIN");
            localStorage.setItem("usuario", userDatos);
        }
        if(userDatos.rolUser == "CLIENT"){
            alert("CLIENT");
            console.log("Usuario CLIENT");
            localStorage.setItem("usuario", userDatos);
        }
        if(userDatos.rolUser == "FIRMA"){
            alert("FIRMA");
            console.log("Usuario FIRMA");
            localStorage.setItem("usuario", userDatos);
        }
    }

    console.log(localStorage.getItem("usuario"))
    //localStorage.clear();
    window.location.href = "../index.html";
}
