const URLSERVERretrieve = "http://localhost:3000/get-stamp/";

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

var datosUsuario = null;
var userId = null;

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
    userId = datosUsuario.id;
}

async function checkUserHosting() {

    console.log("return data");
    return fetch(URLSERVERretrieve + userId, {
        method: "GET"
        /*headers: {
            "Content-Type": "application/png"
        }*/
    })
    .then((response) => { 
        console.log(response);

         if(response.status === 400 || response.status === 500){
            alert("No se ha podido encontrar imagen estampado");
            window.location.href = "table.html";
        }else{

            if(response.status === 204){
                //alert("No existe imagen estampado");

                var con=document.getElementById("main-container");
                var j=document.createElement("div");
                j.textContent="No existe imagen estampado";
                con.appendChild(j);

            }else{    

                return response.blob().then((data) => {
                            console.log(data);
                            return generateWindow(data);
                        }).catch((err) => {
                            console.log(err);
                        })
            }         

        }
    });
    

}

function generateWindow(blob){

    var con=document.getElementById("main-container");
    let img = document.createElement("img");
    img.src = URL.createObjectURL(blob);
    //img.width = 300;
    //document.body.appendChild(img);
    con.appendChild(img);
}


checkUserHosting();