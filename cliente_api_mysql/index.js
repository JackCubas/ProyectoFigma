console.log("index");
//console.log(localStorage);
console.log(JSON.parse(localStorage.getItem("usuario")));

var datosUsuario = null;

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

if(datosUsuario === null){
    document.getElementById("logoutButton").style.display = 'none';
    document.getElementById("userButton").style.display = 'none';
    document.getElementById("pdfButton").style.display = 'none';
}else{

    document.getElementById("loginButton").style.display = 'none';
    document.getElementById("signupButton").style.display = 'none';

    if(datosUsuario.rolUser != "ADMIN"){
        document.getElementById("userButton").style.display = 'none';
    }

}

