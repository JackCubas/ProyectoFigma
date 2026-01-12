const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mysql = require("mysql2");


// Crear servidor Express
const app = express();


const PORT = process.env.APIPORT;
const DBHOST = process.env.DB_HOST;
const DBPORT = process.env.DB_PORT;
const DBUSER = process.env.DB_USER;
const DBPASS = process.env.DB_PASS;
const DBNAME = process.env.DB_NAME;


// Crear conexión MySQL básica
const db = mysql.createConnection({
    host: DBHOST,
    port: DBPORT,
    user: DBUSER,
    password: DBPASS,
    database: DBNAME
});

// Intento de conexión
db.connect((err) => {
    if (err) {
        console.error("Error al conectar MySQL:", err);
        return;
    }
    console.log("Conexión MySQL establecida");
});

// Ruta básica para comprobar el servidor
app.get("/", (req, res) => {
    res.json({ message: "Servidor funcionando" });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});