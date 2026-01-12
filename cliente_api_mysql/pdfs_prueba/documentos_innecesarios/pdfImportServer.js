async function sendData(){
    const URLSERVERUpload = "http://localhost:3000/create-pdf";

    var projectName = document.getElementById("name").value;
    var file = document.getElementById("file").files[0];

    var formData = new FormData();
    formData.append("filename", projectName);
    formData.append("uploadedFile", file);
    formData.append("userId", 2);

    console.log(formData);
    alert("prueba");

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

}