var datosUsuario = null;
var URLSERVERCount = "";

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

if((datosUsuario.rolUser === "CLIENT")){
    //document.getElementById("filterPDF").setAttribute('hidden', "hidden");
    var URLSERVERcountAux = "http://localhost:3000/countPDFs/"
    URLSERVERCount = URLSERVERcountAux + datosUsuario.id
}else{
    var URLSERVERcountAux = "http://localhost:3000/countPDFs/"
    URLSERVERCount = URLSERVERcountAux + 0
}

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
    console.log("Numero total de docs: ");
    console.log(data);

    var totalDocs = data[0].total;
    var docsDeci = totalDocs/10;

    console.log("Numero total de docs: " + totalDocs);

    if(!Number.isInteger(docsDeci)){
        //pageHTML = Math.ceil(totalUsuarios/10);
        newHTML = Math.ceil(totalDocs/10);
    }

    if(Number.isInteger(docsDeci) && docsDeci > 1){
        //pageHTML = Math.ceil(totalUsuarios/10);
        newHTML = Math.ceil(totalDocs/10) + 1;
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
    window.location.href = "table.html?page=" + pageHTML;
  }
}

async function sendData(){
    const URLSERVERUpload = "http://localhost:3000/create-pdf";

    var fileInput = document.getElementById('file');
			
    var filePath = fileInput.value;

    // Allowing file type
    var allowedExtensions = /(\.pdf)$/i;
    
    if (!allowedExtensions.exec(filePath)) {
        alert('Invalid file type');
        fileInput.value = '';
        return false;
    } else { 

        var projectName = document.getElementById("name").value;
        var file = document.getElementById("file").files[0];

        if(projectName === ""){
            alert("Todos los campos son obligatorios.");

        }else if(projectName.length>50){
            alert("El nombre debe tener menos de 51 caracteres.");

		    document.getElementById("name").focus();
            document.getElementById("name").value = "";
        }else{    

        var formData = new FormData();
        formData.append("filename", projectName);
        formData.append("estado", "PENDING");
        formData.append("uploadedFile", file);
        formData.append("userId", datosUsuario.id);

        console.log(formData);
        //alert("prueba");

        //axios.post(URLSERVERUpload,formData).then(res => { console.log(res) })

        const apiCall = await fetch(URLSERVERUpload, {
            method: "POST",
            headers: {
                "Accept": "application/json"
            },
            body: formData,
        }
        );

        const result = await apiCall.json();
        console.log(result);

        if(result.status === 400 || result.status === 500 || result.hasOwnProperty("error")){
            alert("No se ha podido crear documento");
            window.location.href = "table.html?page=" + pageHTML;
        }else{
            //console.log(response);
            alert("Documento creado correctamente");
            window.location.href = "table.html?page=" + newHTML;        
        } 
    }

    //window.location.href = "table.html?page=" + newHTML;

    }
}

checkUserHosting();