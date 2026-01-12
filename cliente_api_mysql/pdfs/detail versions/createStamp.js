var datosUsuario = null;

if(localStorage === null || localStorage.getItem("usuario") === null){
  window.location.href = "../404.html";
}

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

async function sendData(){
    const URLSERVERUpload = "http://localhost:3000/create-stamp";

    var fileInput = document.getElementById('file');		
	var filePath = fileInput.value;

    var result = "";
		
	// Allowing file type
	var allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
			
	if (!allowedExtensions.exec(filePath)) {
        alert('Invalid file type');
        fileInput.value = '';
        return false;
    } 
    else 
    {
			
	// Image preview
	if (fileInput.files && fileInput.files[0]) {

        var jpgExtensions = /(\.jpg)$/i;
        var jpegExtensions = /(\.jpeg)$/i;
        var pngExtensions = /(\.png)$/i;
        var fileType = "";

        if(jpgExtensions.exec(filePath)){
            fileType = ".jpg";
        }

        if(jpegExtensions.exec(filePath)){
            fileType = ".jpeg";
        }

        if(pngExtensions.exec(filePath)){
            fileType = ".png";
        }

        var file = document.getElementById("file").files[0];

        var formData = new FormData();
        formData.append("fileType", fileType);
        formData.append("uploadedFile", file);
        formData.append("userId", datosUsuario.id); //datosUsuario.id

        console.log(formData);
        //alert("prueba");

        //axios.post(URLSERVERUpload,formData).then(res => { console.log(res) })
        
        loader = document.getElementById("loader");
        loader.removeAttribute('hidden');

        const apiCall = await fetch(URLSERVERUpload, {
            method: "POST",
            headers: {
                "Accept": "application/json"
            },
            body: formData,
        }
        );

        result = await apiCall.json();
        console.log(result);

        loader.setAttribute('hidden', "hidden");

    }

    if(result.status === 400 || result.status === 500){
        alert("No se ha podido crear stamp");
        window.location.href = "table.html";
    }else{
        alert("Finalizado procesamiento");
        window.location.href = "table.html";
    }

    
    }
}