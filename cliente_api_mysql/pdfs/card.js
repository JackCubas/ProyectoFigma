const URLSERVERdetail = "http://localhost:3000/users/";

var datosUsuario = null;

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

function checkUserHosting() {

    return fetch(URLSERVERdetail + datosUsuario.id)
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

}


checkUserHosting();


async function sendData(){

    const URLSERVERlecturatarjeta = "http://localhost:3000/lecturaTarjeta";


    const fdUser = {
        fdUserId: datosUsuario.id,
    }

    return fetch(URLSERVERlecturatarjeta, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(fdUser)
    })
    .then((response) => { 
        console.log(response);

        if(response.status === 400 || response.status === 500){
            alert("No se ha podido hacer lectura de tarjeta");
            window.location.href = "table.html?page=1";
        }else{

            alert("Se ha podido hacer lectura de tarjeta");
            window.location.href = "table.html?page=1";
        } 

    });

}
