const URLSERVERdetail = "http://localhost:3000/pdfs/";

function checkUserHosting() {

    var datosURL = window.location.href.split('?');
    var idHTML = datosURL[1].replace("id=","");

    return fetch(URLSERVERdetail + idHTML)
        .then((response) => { 
            return response.json().then((data) => {
                return appendData(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

//pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, nameUser, userId
function appendData(data){
        var con=document.getElementById("main-container")
        for(let i=0;i<data.length;i++){
            console.log(data[i]);
            var d=document.createElement("div")
            d.textContent="Doc Name: " + data[i].DocName                      
            con.appendChild(d);

            var e=document.createElement("div")
            e.textContent="Doc URL: " + data[i].urlCarpeta                      
            con.appendChild(e);

            var f=document.createElement("div")
            f.textContent="User Name: " + data[i].nameUser                      
            con.appendChild(f);
        }
}


checkUserHosting();