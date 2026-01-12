const URLSERVERretrieve = "http://localhost:3000/retrieve";

async function checkUserHosting() {

    return fetch(URLSERVERretrieve, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => { 
        console.log(response);
        return response.blob().then((data) => {
                    console.log(data);
                    return appendData(data);
                }).catch((err) => {
                    console.log(err);
                }) 


    });
    

}

function appendData(response){

        const fileURL = URL.createObjectURL(response);
        console.log(fileURL);
        window.open(fileURL); 

        var con=document.getElementById("main-container")
        var text = document.createTextNode("This is the retrieved document");
        con.appendChild(text);

        /*

        var blob = new Blob([req.response], { type: "application/octetstream" });
 
                //Check the Browser type and download the File.
                var isIE = false || !!document.documentMode;
                if (isIE) {
                    window.navigator.msSaveBlob(blob, fileName);
                } else {
                    var url = window.URL || window.webkitURL;
                    link = url.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.setAttribute("download", fileName);
                    a.setAttribute("href", link);
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }

        */
        
}

checkUserHosting();