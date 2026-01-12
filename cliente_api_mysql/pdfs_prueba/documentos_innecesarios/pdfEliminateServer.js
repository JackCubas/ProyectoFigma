const URLSERVERDelete = "http://localhost:3000/eliminate";

async function sendData(){

    const response = await fetch(URLSERVERDelete, {
        method: "DELETE"
    })

    window.location.href = "pdf.html";

}

function checkUserHosting() {

    var con=document.getElementById("main-container")
    var text = document.createTextNode("This deletes pdf");
    con.appendChild(text);
    

}

checkUserHosting();