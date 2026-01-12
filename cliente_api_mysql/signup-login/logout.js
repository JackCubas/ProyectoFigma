var datosURL = window.location.href;

if(datosURL.includes("?") || datosURL.includes("&") || datosURL.includes("=")){
    window.location.href = "../index.html";
}

function sendData(){
    localStorage.clear();
    window.location.href = "../index.html";
}