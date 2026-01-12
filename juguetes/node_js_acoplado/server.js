import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';

var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

// URLs para documentos html puro.
app.get("/", (req, res) => {
 res.send('Firma Digital Seguro - Grupo 3')
});

app.get("/main", (req, res, next) => { 
 
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
 const _retfile = path.join(__dirname, 'main.html');

 res.sendFile(_retfile);
});

app.get("/mainsite", (req, res, next) => { 
 
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
 const _retfile = path.join(__dirname, 'views/site/mainsite.html');

 res.sendFile(_retfile);
});

app.get("/createpdfHTML", (req, res, next) => { 
 
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
 const _retfile = path.join(__dirname, 'views/site/createPDF_HTML.html');

 res.sendFile(_retfile);
});

app.get("/drawsignaturesHTML", (req, res, next) => { 
 
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
 const _retfile = path.join(__dirname, 'views/site/drawSignatures_HTML.html');

 res.sendFile(_retfile);
});

app.get("/createsvgHTML", (req, res, next) => { 
 
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);
 const _retfile = path.join(__dirname, 'views/site/createSVG_HTML.html');

 res.sendFile(_retfile);
});
//----------------------------------------------------

// URLs para documentos ejs.
app.get("/home", function(req, res) {  
  res.render("site/home", {name:'Chris Martin'});
});

app.get("/dashboard", (req, res) => {
    res.render('site/dashboard', { });
});

app.get("/createpdf", (req, res) => {
    res.render('site/createPDF', { });
});

app.get("/drawsignatures", (req, res) => {
    res.render('site/drawSignatures', { });
});

app.get("/createsvg", (req, res) => {
    res.render('site/createSVG', { });
});

//--------------------------------------------------
// Employees data
const empSalary = [
    {
        name: "Sayan Ghosh",
        salary: 37000
    },
    {
        name: "Susmita Sahoo",
        salary: 365000
    },
    {
        name: "Nabonita Santra",
        salary: 36000
    },
    {
        name: "Anchit Ghosh",
        salary: 30000
    }
]

app.get('/employeesalary', (req, res) => {

    // Render method takes two parameter
    // first parameter is the ejs file to 
    // render second parameter is an 
    // object to send to the ejs file
    res.render('site/salary.ejs', { empSalary: empSalary });
})

//---------------------------------------------------