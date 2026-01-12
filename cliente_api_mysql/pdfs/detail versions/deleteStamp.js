const URLSERVERDelete = "http://localhost:3000/delete-stamp";

var datosUsuario = null;

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
     datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

async function sendData(){

    var userId = datosUsuario.id;

    const response = await fetch(URLSERVERDelete + '?userId=' + userId, {
        method: "DELETE"
    })

    window.location.href = "table.html";

}