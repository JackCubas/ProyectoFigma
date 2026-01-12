require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    port: process.env.DBPORT,
    database: process.env.DBNAME
});

db.connect((err) => {
    if (err) {
        console.log("Error conectando a MySQL:", err);
        return;
    }
    console.log("Conexión establecida con MySQL");
});

app.post("/create-movie", (req, res) => {
    const { prodId, price, quantity } = req.body;

    if (!prodId || !price || !quantity) {
        return res.status(400).json({ error: "Faltan datos en el body" });
    }

    const sql = "INSERT INTO movies (prodId, price, quantity) VALUES (?, ?, ?)";

    db.query(sql, [prodId, price, quantity], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Error al insertar" });
        }
        res.json({ message: "Registro insertado correctamente" });
    });
});

const PORT = process.env.APIPORT;

app.listen(PORT, () => {
    console.log("Servidor iniciado en el puerto " + PORT);
});
