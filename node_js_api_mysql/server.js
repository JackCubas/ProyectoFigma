const express = require('express');
const morgan = require('morgan');
var cors = require('cors');
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const mysql = require('mysql2');

const DBPORT= process.env.DBPORT;
const DBHOST= process.env.DBHOST;
const DBUSER= process.env.DBUSER;
const DBPASS= process.env.DBPASS;
const DBNAME= process.env.DBNAME;
const APIPORT= process.env.APIPORT;
const CARPETAPDF= process.env.CARPETAPDF;
const CARPETASTAMP= process.env.CARPETASTAMP;


app.set('view engine','ejs');
//app.use(express.json());
//app.use(express.static('public'));
app.use(morgan('dev'));
app.use(express.urlencoded({extended: true}));
app.use(cors());

var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(express.json({limit: '50mb'}));


const fs = require('fs');
const fileUpload = require('express-fileupload');
const util = require("util");
const crypto = require("crypto")
const pdfParse = require('pdf-parse');

const path = require('path');
const assert = require('assert');
const { PDFDocument } = require('pdf-lib');
const { degrees, rgb, StandardFonts } = require('pdf-lib');
const { Jimp } = require("jimp");
const CryptoJS = require("crypto-js");
//const gm = require('gm');



app.use((req, res, next) => {
    console.log('new request made:');
    //console.log('host: ', req.hostname);
    //console.log('path: ', req.path);
    //console.log('method: ', req.method);
    next();
});

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});



//----------------------------------------------------------------------------------------
var key = Buffer.from('MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=', 'base64');

function encrypt(plaintext) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    key,
    iv
  );
  let encrypted = Buffer.concat([iv, cipher.update(plaintext, 'utf8'), cipher.final()]);
  return encrypted.toString('base64url');
}

function decrypt(ivCiphertextB64) {
  const ivCiphertext = Buffer.from(ivCiphertextB64, 'base64url');
  const iv = ivCiphertext.subarray(0, 16);
  const ciphertext = ivCiphertext.subarray(16);
  const cipher = crypto.createDecipheriv(
    'aes-256-cbc',
    key,
    iv
  );
  let decrypted = Buffer.concat([cipher.update(ciphertext), cipher.final()]);
  return decrypted.toString('utf-8');
}
//------------------------------------------------------------------------------------

async function computePdfMetadata(filePath){
  try{
    const buffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    let numPages = 0;
    try{
      const data = await pdfParse(buffer);
      numPages = data && data.numpages ? data.numpages : 0;
    }catch(err){
      console.error('pdf-parse error:', err);
    }
    const uploadTimestamp = new Date();
    return { fileSize, numPages, sha256: hash, uploadTimestamp };
  }catch(err){
    console.error('computePdfMetadata error:', err);
    return { fileSize: 0, numPages: 0, sha256: null, uploadTimestamp: new Date() };
  }
}

//---------------------------------------------

function genKeyPairStrong(phrase) {
  const keyPair = crypto.generateKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: phrase
    },
  });

  // Create the public key file
  //fs.writeFileSync(__dirname + "/id_rsa_pub.pem", keyPair.publicKey);

  // Create the private key file
  //fs.writeFileSync(__dirname + "/id_rsa_priv.pem", keyPair.privateKey);

  return keyPair;
}



function genKeyPairSimple() {
  // Generates an object where the keys are stored in properties `privateKey` and `publicKey`
  const keyPair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096, // bits - standard for RSA keys
    publicKeyEncoding: {
      type: "pkcs1", // "Public Key Cryptography Standards 1"
      format: "pem", // Most common formatting choice
    },
    privateKeyEncoding: {
      type: "pkcs1", // "Public Key Cryptography Standards 1"
      format: "pem", // Most common formatting choice
    },
  });

  // Create the public key file
  //fs.writeFileSync(__dirname + "/id_rsa_pub.pem", keyPair.publicKey);

  // Create the private key file
  //fs.writeFileSync(__dirname + "/id_rsa_priv.pem", keyPair.privateKey);

  return keyPair;
}

function getPublicKeyfromPrivateKey(privateKeyByte){
  const privateKey = Buffer.from(privateKeyByte, 'hex'); //your_32_byte_private_key_here 
  const publicKey = crypto.getPublicKey(privateKey, { format: 'hex', type: 'compressed' });

  return publicKey;
}

//const encrypted = encryptMessage(receiverPublicKey, message);
//const decrypted = decryptMessage(receiverPrivateKey, message);

function encryptWithPublicKey(publicKey, message) {
  const bufferMessage = Buffer.from(message, "utf8");
  return crypto.publicEncrypt(publicKey, bufferMessage);
}

function encryptWithPrivateKey(privateKey, message) {
  const bufferMessage = Buffer.from(message, 'utf8');
  return crypto.privateEncrypt(privateKey, bufferMessage);
}

function decryptWithPublicKey(publicKey, encryptedMessage) { 
  return crypto.publicDecrypt(publicKey, encryptedMessage);
}

function decryptWithPrivateKey(privateKey, encryptedMessage) {
  return crypto.privateDecrypt(privateKey, encryptedMessage);
}

//encryptWithPrivateKeyProcess
function signMessage(senderPrivateKey, myData){
  /*
  const myData = {
    firstName: 'Zach',
    lastName: 'Gollwitzer',
    socialSecurityNumber: 'NO NO NO.  Never put personal info in a digitally \
    signed message since this form of cryptography does not hide the data!'
  };
  */

  //const senderPrivateKey = fs.readFileSync(__dirname + "/id_rsa_priv.pem", "utf8");

  const hash = crypto.createHash("sha256");
  const myDataString = JSON.stringify(myData); // String version of our data that can be hashed
  hash.update(myDataString); // Sets the value on the hash object: requires string format, so we must convert our object
  const hashedData = hash.digest("hex"); // Hashed data in Hexidecimal format

  var signedMessage = null;
  signedMessage = encryptWithPrivateKey(senderPrivateKey, hashedData);

  /*
  module.exports = {
    algorithm: 'sha256',
    originalData: myData,
    signedAndEncryptedData: signedMessage
  };
  */

  return signedMessage;

}

//decryptWithPublicKeyProcess
function verifySenderUser(senderPublicKey, signAlgorithm, receivedEncryptedData, recievedOriginalData){
  
  // We have the sender's public key here:
  //const senderPublicKey = fs.readFileSync(__dirname + "/id_rsa_pub.pem", "utf8");

  // ==================================
  // Step 1: Decrypt the signed message
  // ==================================
  var decryptedMessage = null;
  decryptedMessage = decryptWithPublicKey(senderPublicKey, receivedEncryptedData);
  const decryptedMessageHex = decryptedMessage.toString(); // By default, returns a Buffer object, so convert to string

  // ========================================
  // Step 2: Take a hash of the original data
  // ========================================
  // Use the hash function provided!
  const hash = crypto.createHash(signAlgorithm); //deberia ser algorithm: 'sha256' de la funcion de firmado
  const hashOfOriginal = hash.update(JSON.stringify(recievedOriginalData));
  const hashOfOriginalHex = hash.digest("hex");

  // ========================================
  // Step 3: Check if two hashes match
  // ========================================
  if (hashOfOriginalHex === decryptedMessageHex) {
    console.log(
      "Success: The data has not been tampered with and the sender is valid."
    );
  } else {
    console.log(
      "Failure: Someone is trying to manipulate the data or someone else is sending this!  Do not use!"
    );
  }

  return decryptedMessageHex;

}


//-------------------------------------------
//-------------------------------------------
//-------------------------------------------
//-------------------------------------------



app.get('/users', (req, res) => {
  console.log("get all users!");

  let connection;
  var resultRows;

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;
          
          connection.query("SELECT id, nameUser, rolUser FROM users", function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));
              //console.log(resultRows);

              console.log("Ending connection");
              connection.end();          

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
  }
});

app.get('/countUsers', (req, res) => {
  console.log("counts all users!");

  let connection;
  var resultRows;

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;
          
          connection.query("SELECT count(*) as total FROM users", function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));
              //console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
  }
});

app.get('/users_pag', (req, res) => {
  console.log("get all users del paginacion!");

  const page = req.query.page;

  let connection;
  var resultRows;

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;

          var sql = "SELECT id, nameUser, rolUser FROM users LIMIT 10";

          if(page > 1){
            sql = sql + " OFFSET " + ((page-1)*10);
          }
          console.log(sql);
          connection.query(sql, function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));
              //console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
      connection.end();
  }
});

app.get('/users/:id', (req, res) => {
    console.log("get user!");

  let con;
  var resultRows;
  const { id } = req.params;

  con = mysql.createConnection({
        host: DBHOST,
        user: DBUSER,
        password: DBPASS,
        port     :DBPORT,
        database: DBNAME
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    let sql = "SELECT id, nameUser, emailUser, passUser, rolUser, dniUser, IF(atr IS NULL,0,1) AS atrexists from users WHERE id = ?";

    let values = [
      [id]
    ]

    con.query(sql, [values], function (err, result, fields) {
        if (err) throw err;
        
        //console.log(result);

        resultRows = Object.values(JSON.parse(JSON.stringify(result)));
        
        if(resultRows.length > 0){
          resultFinal = resultRows[0];

          var passBBDD = decrypt(resultFinal.passUser);
          var passCrypt = CryptoJS.AES.encrypt(passBBDD, "firma_app").toString();
          resultFinal.passUser = passCrypt;

          var emailBBDD = resultFinal.emailUser;
          var emailCrypt = CryptoJS.AES.encrypt(emailBBDD, "firma_app").toString();
          resultFinal.emailUser = emailCrypt;

          var dniBBDD = resultFinal.dniUser;
          var dniCrypt = CryptoJS.AES.encrypt(dniBBDD, "firma_app").toString();
          resultFinal.dniUser = dniCrypt;

          resultRows[0] = resultFinal;
        }

        console.log("Ending connection");
        con.end();

        res.json(resultRows);
    });
    
  });
});


app.post('/users', (req, res) => {
    // simple validation
    console.log("llega a create users");

    return insertUser(req, res); 
    
});

async function insertUser(req, res){

  con = mysql.createConnection({
        host: DBHOST,
        user: DBUSER,
        password: DBPASS,
        port     :DBPORT,
        database: DBNAME
  });

  const { nameUser, emailUser, passUser, rolUser, dniUser } = req.body || {};

  var decryptedEmail = CryptoJS.AES.decrypt(emailUser, "firma_app");
  var decryptedEmailString = decryptedEmail.toString(CryptoJS.enc.Utf8);

  var decryptedPass = CryptoJS.AES.decrypt(passUser, "firma_app");
  var decryptedPassString = decryptedPass.toString(CryptoJS.enc.Utf8);

  var decryptedDNI = CryptoJS.AES.decrypt(dniUser, "firma_app");
  var decryptedDNIString = decryptedDNI.toString(CryptoJS.enc.Utf8);

  console.log(nameUser + "," + emailUser + "," + passUser + "," + rolUser + "," + dniUser);
  console.log(decryptedEmailString + "," + decryptedPassString + "," + decryptedDNIString);

  if (!nameUser || nameUser.trim().length < 2) return res.status(400).json({ error: 'Nombre requerido (min 2 chars)' });
  if (!decryptedEmailString || !/^\S+@\S+\.\S+$/.test(decryptedEmailString)) return res.status(400).json({ error: 'Mail valido requerido' });
  if (!decryptedPassString || decryptedPassString.length < 6) return res.status(400).json({ error: 'Contraseña requerida (min 6 chars)' });
  const allowedRoles = ['ADMIN', 'CLIENT', 'FIRMA'];
  if (!rolUser || !allowedRoles.includes(rolUser)) return res.status(400).json({ error: 'Rol invalido' });

  console.log("checking if user email exists!");
  var existe = false;
  let sql = `SELECT * from users WHERE emailUser = "${decryptedEmailString}"`;
  try{
    await con.promise().query(sql)
      .then( ([rows,fields]) => {

          var rowsObject = JSON.stringify(rows);
          console.log("rows: " + rowsObject);
          console.log("rows size: " + rowsObject.length);


          if(rowsObject === null || rowsObject === "" || rowsObject.length < 3){
            console.log("Usuario no existe");
            existe = false;
            return;
          }else{
            console.log("Usuario existe");
            //res.status(400).json({ error: 'Usuario existe' });
            existe = true;
            return;
          }
      })
  }catch(error){
    console.log(error);
  }

  if(existe === true){
    console.log("Ending connection");
    con.end();

    res.status(400).json({ error: 'Usuario existe' });
  }else{

    console.log("llega a encriptar users");
    passEncrypt = encrypt(decryptedPassString);

    console.log("llega a conectar users");
    con.connect(function(err) {
      if (err) {
        console.error('DB connect error:', err);
        return res.status(500).json({ error: 'database connection error' });
      }

      const sql = 'INSERT INTO users (nameUser, emailUser, passUser, rolUser, dniUser) VALUES ?';
      const values = [[nameUser.trim(), decryptedEmailString.trim(), passEncrypt, rolUser, decryptedDNIString || null]];

      console.log("llega a generar query users");

      con.query(sql, [values], function (err, result) {
        if (err) {
          console.error('DB insert error:', err);
          return res.status(500).json({ error: 'database insert error' });
        }
        return res.json(result);
      });
    });

  }

}


app.put('/users/:id', (req, res) => {

  console.log("update user!");

  return modifyUser(req, res);  
});

async function modifyUser(req, res){

  const { id } = req.params;
  const { nameUser, emailUser, passUser, rolUser, dniUser} = req.body;

  var decryptedEmail = CryptoJS.AES.decrypt(emailUser, "firma_app");
  var decryptedEmailString = decryptedEmail.toString(CryptoJS.enc.Utf8);

  var decryptedPass = CryptoJS.AES.decrypt(passUser, "firma_app");
  var decryptedPassString = decryptedPass.toString(CryptoJS.enc.Utf8);

  var decryptedDNI = CryptoJS.AES.decrypt(dniUser, "firma_app");
  var decryptedDNIString = decryptedDNI.toString(CryptoJS.enc.Utf8);

  console.log(id + " - " + nameUser + " - " + emailUser + " - " + passUser);
  console.log(decryptedEmailString + "," + decryptedPassString + "," + decryptedDNIString);


  con = mysql.createConnection({
        host: DBHOST,
        user: DBUSER,
        password: DBPASS,
        port     :DBPORT,
        database: DBNAME
  });

  console.log("checking if user email exists!");
  var existe = false;
  let sql = `SELECT * from users WHERE emailUser = "${decryptedEmailString}" and id not in ("${id}")`;
  try{
    await con.promise().query(sql)
      .then( ([rows,fields]) => {

          var rowsObject = JSON.stringify(rows);
          console.log("rows: " + rowsObject);
          console.log("rows size: " + rowsObject.length);


          if(rowsObject === null || rowsObject === "" || rowsObject.length < 3){
            console.log("Usuario no existe");
            existe = false;
            return;
          }else{
            console.log("Usuario existe");
            //res.status(400).json({ error: 'Usuario existe' });
            existe = true;
            return;
          }
      })
  }catch(error){
    console.log(error);
  }

  if(existe === true){
    console.log("Ending connection");
    con.end();

    res.status(400).json({ error: 'Usuario existe' });
  }else{

    passEncrypt = encrypt(decryptedPassString);

    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");

      let sqlModify = `
        UPDATE users 
        SET nameUser = "${nameUser}", 
        emailUser = "${decryptedEmailString}",
        passUser = "${passEncrypt}",
        rolUser = "${rolUser}",
        dniUser = "${decryptedDNIString}" 
        WHERE id = "${id}"
      `;
      con.query(sqlModify, function (err, result) {
        if (err) throw err;
        console.log("1 record modified");
        console.log(result);

        console.log("Ending connection");
        con.end();

        res.json(result);
      });
      
    });

  }
}



app.delete('/users/:id', (req, res) => {
    console.log("delete user!");

    const { id } = req.params;

    console.log("conectando para borrado");

    response = borrarUsuario(id);
    res.status(200).json(response); 
});

//-------------------------------------------
async function borrarUsuario(id){

  var listaDocs = await searchPDFsSignedStampedCarpeta(id);
  console.log("lista de docs explorado:");
  console.log(listaDocs);

  var responseBorrarCarpeta = await borrarCarpetasPdfs(id);
  var response = await borrarUsuarioBBDD(id);

  return {success: 'TRUE'};

}

async function searchPDFsSignedStampedCarpeta(id){

  var toRet = true;
  var existe = false;
  let con;

  listaDocs = [];

  con = mysql.createConnection({
        host: DBHOST,
        user: DBUSER,
        password: DBPASS,
        port     :DBPORT,
        database: DBNAME
  });

  let sql = `
    select urlCarpeta, stampUserId, signUserId from pdfs 
    WHERE signUserId = "${id}" or stampUserId = "${id}"
  `;
  try{
    await con.promise().query(sql)
        .then( ([rows,fields]) => {

            var rowsObjectString = JSON.stringify(rows);
            if(rowsObject !== null && rowsObject !== ""){
              var rowsObject = JSON.parse(rowsObjectString.toString())

              if(rowsObject.length > 0){
                console.log("Docs existe");
                existe = true;

                for (let i = 0; i < rowsObject.length; i++){
                  listaDocs.push(JSON.parse(JSON.stringify(rowsObject[i])));
                }
              }else{
                console.log("Docs no existe");
                existe = false;
                return;
              }
            }else{
              console.log("Docs no existe");
              existe = false;
              return;

            }
        })
  }catch(error){
    console.log(error);

    console.log("Ending connection");
    con.end();
  }

  if(existe === true){

    console.log("Docs existe...............");
    console.log(listaDocs);
    console.log("num docs stamp and signed: " + listaDocs.length);

    console.log("Ending connection");
    con.end();

    await borrarPDFsSignedStampedCarpeta(listaDocs, id);
    await borrarPdfsSignedStampedBBDD(id);
    
  }else{
    console.log("Docs no existe...............");

    console.log("Ending connection");
    con.end();
  }  
  return toRet;
}

async function borrarPDFsSignedStampedCarpeta(listaDocs, id){

  console.log("Entrado en borrado de pdfs firmados y estampados");

  if(listaDocs !== null && listaDocs.length > 0){

    console.log(listaDocs);

    for (let i = 0; i < listaDocs.length; i++) {
      //var doc = JSON.parse(listaDocs[i]);
      var doc = listaDocs[i];

      if(Object.hasOwn(doc, "urlCarpeta") && Object.hasOwn(doc, "stampUserId") && Object.hasOwn(doc, "signUserId")){

        var urlCarpetaOriginal = doc.urlCarpeta;
        var stampUserId = doc.stampUserId;
        var signUserId = doc.signUserId;

        urlCarpetaOriginal = urlCarpetaOriginal.slice(0,-4);
        var urlCarpetaSigned = urlCarpetaOriginal + "-sign" + ".pdf";
        var urlCarpetaStamped = urlCarpetaOriginal + "-stamp" + ".pdf";

        console.log("nombres de archivos stamp y sign: " + urlCarpetaSigned + " " + urlCarpetaStamped);

        if ((fs.existsSync(urlCarpetaSigned)) && (!isNaN(signUserId)) && (parseInt(id) === parseInt(signUserId))) {
        // delete the file on server after it sends to client
          console.log("eliminando pdf signed");
          const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
          unlinkFile(urlCarpetaSigned);
        }

        if ((fs.existsSync(urlCarpetaStamped)) && (!isNaN(stampUserId)) && (parseInt(id) === parseInt(stampUserId))) {
        // delete the file on server after it sends to client
          console.log("eliminando pdf stamped");
          const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
          unlinkFile(urlCarpetaStamped);
        }
      }

    }

  }

  return true;
}

async function borrarPdfsSignedStampedBBDD(id){

  let con;

  var signUserId = null;
  var signTimestamp = null;

  var stampUserId = null;
  var stampTimestamp = null;

  con = mysql.createConnection({
        host: DBHOST,
        user: DBUSER,
        password: DBPASS,
        port     :DBPORT,
        database: DBNAME
  });

  let sqlSign = `
      UPDATE pdfs 
      SET signUserId = "${signUserId}", 
      signTimestamp = "${signTimestamp}"
      WHERE signUserId = "${id}"
    `;

  let sqlStamp = `
      UPDATE pdfs 
      SET stampUserId = "${stampUserId}", 
      stampTimestamp = "${stampTimestamp}"
      WHERE stampUserId = "${id}"
    `;
  
   try{
    await con.promise().query(sqlSign)
      .then( ([rows,fields]) => {

          var rowsObject = JSON.stringify(rows);
          console.log("rows signed: " + rowsObject);
          //console.log("rows signed size: " + rowsObject.length);
      })
  }catch(error){
    console.log(error);

    console.log("Ending connection");
    con.end();
  }

  try{
    await con.promise().query(sqlStamp)
      .then( ([rows,fields]) => {

          var rowsObject = JSON.stringify(rows);
          console.log("rows stamped: " + rowsObject);
          //console.log("rows stamped size: " + rowsObject.length);

      })
  }catch(error){
    console.log(error);

    console.log("Ending connection");
    con.end();
  }

  console.log("Ending connection");
  con.end();

}


async function borrarCarpetasPdfs(id){

  const pathCarpetaPDF  = CARPETAPDF + "/" + id;
  const pathStamp = CARPETASTAMP + "/" + id + '.png';

  console.log(pathCarpetaPDF + " - " + pathStamp);

  if (fs.existsSync(pathStamp)) {
  // delete the file on server after it sends to client
    console.log("eliminando stamp");
    const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
    unlinkFile(pathStamp);
  }

  if (fs.existsSync(pathCarpetaPDF)){

    if(fs.readdirSync(pathCarpetaPDF).length === 0){
      console.log("eliminando carpeta vacia");
      fs.rmdirSync(pathCarpetaPDF);
    }else{
      console.log("eliminando carpeta no vacia");
      fs.rmSync(pathCarpetaPDF, { recursive: true, force: true });
    }

  }

  //-------------------------------------------

  let con;

  con = mysql.createConnection({
        host: DBHOST,
        user: DBUSER,
        password: DBPASS,
        port     :DBPORT,
        database: DBNAME
  });

  await con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to borrado de pdfs del usuario");

    let sql = "DELETE FROM pdfs WHERE userId = ?";

    let values = [
      [id]
    ]

    con.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log(result);

      console.log("Ending connection");
      con.end();

      return result;
    });
    
  });

}

async function borrarUsuarioBBDD(id){

  let con;

  con = mysql.createConnection({
        host: DBHOST,
        user: DBUSER,
        password: DBPASS,
        port     :DBPORT,
        database: DBNAME
  });

  var toRet = null;

  await con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to borrado del usuario");

    let sql = "DELETE FROM users WHERE id = ?";

    let values = [
      [id]
    ]

    con.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log("1 record deleted");
      console.log(result);

      console.log("Ending connection");
      con.end();

      toRet = result;
      return toRet;
    });
    
  });
 
}

//--------------------------------


app.post('/login', (req, res) => {
  //const userEmail = req.query.email;
  //const userPass = req.query.pass;

  const { userEmail, userPass} = req.body || {};

  if (!userEmail || !userPass) {
    return res.status(400).json({ error: 'email y contra son requeridos' });
  }

  console.log("email: " + userEmail + " userPass: " + userPass);

  var decryptedEmail = CryptoJS.AES.decrypt(userEmail, "firma_app");
  var decryptedEmailString = decryptedEmail.toString(CryptoJS.enc.Utf8);

  var decryptedPass = CryptoJS.AES.decrypt(userPass, "firma_app");
  var decryptedPassStringRecieved = decryptedPass.toString(CryptoJS.enc.Utf8);

  console.log("emailDecrypt: " + decryptedEmailString + " userPassDecrypt: " + decryptedPassStringRecieved);

  if(!/^\S+@\S+\.\S+$/.test(decryptedEmailString)){
    return res.status(400).json({ error: 'email y contra son requeridos' });
  }

  const con = mysql.createConnection({
        host: DBHOST,
        user: DBUSER,
        password: DBPASS,
        port     :DBPORT,
        database: DBNAME
  });

  con.connect(function(err) {
    if (err) {
      console.error('DB connect error:', err);
      return res.status(500).json({ error: 'database connection error' });
    }

    const sql = 'SELECT * FROM users WHERE emailUser = ?';
    con.query(sql, [decryptedEmailString.trim()], function (err, result) {
        if (err) {
          console.error('DB query error:', err);

          console.log("Ending connection");
          con.end();

          return res.status(500).json({ error: 'database query error' });
        }

        const rows = Object.values(JSON.parse(JSON.stringify(result)));
        if (!rows || rows.length === 0){ 

          console.log("Ending connection");
          con.end();

          return res.status(204).json({ user: 'FALSE' });
        }

        if(rows.length > 0){
          console.log(rows);
          resultFinal = rows[0];
          console.log(resultFinal);
          passUserDecrypt = decrypt(resultFinal.passUser);

          if(!passUserDecrypt || passUserDecrypt != decryptedPassStringRecieved){

            
            console.log("Ending connection");
            con.end();

            return res.status(204).json({ user: 'FALSE' });

          }else{
            rows[0] = resultFinal;
          }
        }

        console.log("Ending connection");
        con.end();

        return res.json({ user: rows });
    });
  });
});

app.get('/users/checkUserEMail/:email', (req, res) => {
  console.log("checking if user exists!");

  const { email } = req.params;

  con = mysql.createConnection({
        host: DBHOST,
        user: DBUSER,
        password: DBPASS,
        port     :DBPORT,
        database: DBNAME
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    let sql = "SELECT *  from users WHERE email = ?";

    let values = [
      [email]
    ]

    con.query(sql, [values], function (err, result, fields) {
        if (err) throw err;
        
        console.log(result);

        resultRows = Object.values(JSON.parse(JSON.stringify(result)));
        console.log(resultRows);

        console.log("Ending connection");
        con.end();

        res.json(result);
        
    });
    
  });


});

//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------


app.get("/pdfs", cors(), (req, res) => {

  //console.log("get all pdfs!");

  let connection;
  var resultRows;

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;
          
        //SELECT id, name, CONCAT('data:image/jpeg;base64,', CAST(blob_data AS CHAR CHARSET utf8mb4)) AS base64_data FROM blob_table;
        //SELECT id, name, TO_BASE64(blob_data) AS base64_data FROM pdfs
        //SELECT id, userId, name, urlCarpeta FROM pdfs
          var queryBusqueda = "SELECT pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, estado, nameUser, DATE_ADD(initialUploadTimestamp, INTERVAL 1 HOUR) as initialUploadTimestamp, userId FROM pdfs INNER JOIN users ON pdfs.userId = users.id"
          connection.query(queryBusqueda, function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));

              //var carpetUrl = resultRows[0].urlCarpeta;

              //console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
  }

});

app.get('/countPDFs/:userId', (req, res) => {
  console.log("counts all docs!");

  let connection;
  var resultRows;

  const { userId } = req.params;
  var numId = null;

  var sql = "SELECT count(*) as total FROM pdfs"

  if(!isNaN(userId)){
    numId = parseInt(userId)
  }

  if(numId > 0){
    sql = sql + " where userId = " + userId;
  }

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;
          
          connection.query(sql, function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));
              //console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");

      console.log("Ending connection");
      connection.end();
  }
});

app.get('/pdfs_pag', cors(), (req, res) => {
  console.log("get all pdfs del paginacion!");

  const page = req.query.page;

  let connection;
  var resultRows;

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;

          var sql = "SELECT pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, estado, nameUser, DATE_ADD(initialUploadTimestamp, INTERVAL 1 HOUR) as initialUploadTimestamp, userId FROM pdfs INNER JOIN users ON pdfs.userId = users.id LIMIT 10";

          if(page > 1){
            sql = sql + " OFFSET " + ((page-1)*10);
          }
          console.log(sql);
          connection.query(sql, function (err, result, fields) {
              if (err) throw err;
              
              resultRows = Object.values(JSON.parse(JSON.stringify(result)));
              console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");

      console.log("Ending connection");
      connection.end();
  }
});

app.get("/pdfsByUser/:userId", cors(), (req, res) => {

   console.log("get all pdfs for user!");

  let connection;
  var resultRows;
  const { userId } = req.params;

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;
          
        //SELECT id, name, CONCAT('data:image/jpeg;base64,', CAST(blob_data AS CHAR CHARSET utf8mb4)) AS base64_data FROM blob_table;
        //SELECT id, name, TO_BASE64(blob_data) AS base64_data FROM pdfs

          var sql = "SELECT pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, estado, nameUser, DATE_ADD(initialUploadTimestamp, INTERVAL 1 HOUR) as initialUploadTimestamp, userId FROM pdfs INNER JOIN users ON pdfs.userId = users.id WHERE userId = ?";

          let values = [
            [userId]
          ]

          connection.query(sql,[values], function (err, result, fields) {
              if (err) throw err;
              
              console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));

              console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");

      console.log("Ending connection");
      connection.end();
  }

});

app.get('/pdfsByUser_pag/:userId', cors(), (req, res) => {
  console.log("get all pdfs del paginacion del user!");

  const page = req.query.page;

  let connection;
  var resultRows;
  const { userId } = req.params;

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;

          var sql = "SELECT pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, estado, nameUser, DATE_ADD(initialUploadTimestamp, INTERVAL 1 HOUR) as initialUploadTimestamp, userId FROM pdfs INNER JOIN users ON pdfs.userId = users.id WHERE userId = ? LIMIT 10";

          if(page > 1){
            sql = sql + " OFFSET " + ((page-1)*10);
          }

          let values = [
            [userId]
          ]

          console.log(sql);
          connection.query(sql,[values], function (err, result, fields) {
              if (err) throw err;
              
              resultRows = Object.values(JSON.parse(JSON.stringify(result)));
              console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");

      console.log("Ending connection");
      connection.end();
  }
});

app.get("/pdfs/:id", cors(), (req, res) => {

  //console.log("get pdf by id!");

  let connection;
  var resultRows;
  const { id } = req.params;

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;

          //var sql = "SELECT id, userId, name, urlCarpeta FROM pdfs WHERE id = ?";
          var queryBusqueda = "SELECT pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, nameUser, estado, DATE_ADD(initialUploadTimestamp, INTERVAL 1 HOUR) as initialUploadTimestamp, userId FROM pdfs INNER JOIN users ON pdfs.userId = users.id WHERE pdfs.id = ?"

          let values = [
            [id]
          ]

          connection.query(queryBusqueda,[values], function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));

              //console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");

      console.log("Ending connection");
      connection.end();
  }

});

app.get("/pdfsByCriteria", cors(), (req, res) => {

  console.log("get all pdfs by criteria!");

  let connection;
  var resultRows;

  console.log("email: " + req.query.emailUser + " nameUser: " + req.query.nameUser + " docName: " + req.query.docName + " estado: " + req.query.estado);

  var emailUser = req.query.emailUser || "";
  var nameUser = req.query.nameUser || "";
  var docName = req.query.docName || "";
  var estado = req.query.estado || "";

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;
          
        //SELECT id, name, CONCAT('data:image/jpeg;base64,', CAST(blob_data AS CHAR CHARSET utf8mb4)) AS base64_data FROM blob_table;
        //SELECT id, name, TO_BASE64(blob_data) AS base64_data FROM pdfs

          var queryBusqueda = `
          SELECT pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, nameUser, emailUser, estado, userId 
          FROM pdfs INNER JOIN users ON pdfs.userId = users.id 
          WHERE 
          emailUser like '%${emailUser}%' AND
          nameUser like '%${nameUser}%' AND
          pdfs.name like '%${docName}%' AND
          estado like '%${estado}%'
          `


          connection.query(queryBusqueda, function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));
              console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");

      console.log("Ending connection");
      connection.end();
  }

});

//------------------
//------------------
app.post('/create-pdf', fileUpload(), async (req, res) => {

  console.log("llegado al create-pdf: " + req.body.estado); 
  const pdfFile = req.files && req.files.uploadedFile ? req.files.uploadedFile : null;
  const nombreFile = req.body.filename;
  const estado = req.body.estado || 'PENDING';
  const userId = req.body.userId;

  const initialTimestamp = new Date(Date.now() + 1 * (60 * 60 * 1000) ).toISOString().slice(0, 19).replace('T', ' ');
  const initialTimestampNameAux = initialTimestamp.replace(" ","_").replaceAll(":","-");
  const initialTimestampName = initialTimestampNameAux.replaceAll("-","_");

  const archivoNombre = CARPETAPDF + "/" + userId + "/" + nombreFile + "_" + initialTimestampName + '.pdf';
  const carpetaNombre  = CARPETAPDF + "/" + userId;
  console.log(archivoNombre);

  if(!pdfFile){
    return res.status(400).json({ error: 'No uploadedFile provided' });
  }

  try{
    if (!fs.existsSync(carpetaNombre)){
      fs.mkdirSync(carpetaNombre);
    }

    fs.writeFileSync(archivoNombre, pdfFile.data);
    console.log('File written successfully', archivoNombre);

    // compute metadata
    const metadata = await computePdfMetadata(archivoNombre);

    //-------------------------------
    console.log("llegado a la base de datos"); 
    let con;

    con = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
    });

    con.connect(function(err) {
      if (err) {
        console.error('DB connect error:', err);
        return res.status(500).json({ error: 'database connection error' });
      }
      console.log("Connected to pdf!");
      console.log(req.body);

      let sql = "INSERT INTO pdfs (userId, name, urlCarpeta, estado, fileSize, numPages, sha256, uploadTimestamp, initialUploadTimestamp) VALUES ?";

      let values = [
        [req.body.userId, nombreFile, archivoNombre, estado, metadata.fileSize, metadata.numPages, metadata.sha256, metadata.uploadTimestamp, initialTimestamp]
      ]

      con.query(sql, [values], function (err, result) {
        if (err) {
          console.error('DB insert error:', err);
          return res.status(500).json({ error: 'database insert error' });
        }
        console.log("1 record inserted into pdf");
        console.log(result);

        console.log("Ending connection");
        con.end();

        res.json(result);
      });
      
    });

  }catch(err){
    console.error('create-pdf error:', err);

    console.log("Ending connection");
    con.end();

    return res.status(500).json({ error: 'failed to save or process pdf' });
  }
});


//-------------------
//-------------------

app.get('/retrieve/:thisDocName/:userId/:initialTimestampName/:docStatus', function(req, res) {
  const { thisDocName, userId, initialTimestampName, docStatus} = req.params;
  
  const pathRetrieveOriginal = CARPETAPDF + "/" + userId + "/" + thisDocName + "_" + initialTimestampName + '.pdf'; // path where to file is stored in server
  const pathRetrieveSign = CARPETAPDF + "/" + userId + "/" + thisDocName + "_" + initialTimestampName + "-sign" + '.pdf';
  const pathRetrieveStamp = CARPETAPDF + "/" + userId + "/" + thisDocName + "_" + initialTimestampName + "-stamp" + '.pdf';

  var pathRetrieve = pathRetrieveOriginal;

  if((docStatus === "ORIGINAL") && fs.existsSync(pathRetrieveOriginal)){
    pathRetrieve = pathRetrieveOriginal;
  }

  if((docStatus === "SIGN") && fs.existsSync(pathRetrieveSign)){
    pathRetrieve = pathRetrieveSign;
  }

  if((docStatus === "STAMP") && fs.existsSync(pathRetrieveStamp)){
    pathRetrieve = pathRetrieveStamp;
  }

  if (fs.existsSync(pathRetrieve)) {
    //console.log("llegado al retrieve puro");
    const rs = fs.createReadStream(pathRetrieve);

    // get size of the video file
    const { size } = fs.statSync(pathRetrieve);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", size);
    rs.pipe(res);
  }else{
    return res.status(500).json({ error: 'database connection error' });
  }
  
})


app.delete('/eliminateDocOriginal', async function(req, res) {

  const id = req.query.id;
  const docName = req.query.docName;
  const userId = req.query.userId;
  const initialTimestampName = req.query.initialTimestampName;

  if (!id || !docName || !userId || !initialTimestampName) {
    return res.status(400).json({ id: 'id, userid y docName son requeridos' });
  }

  console.log("id: " + id + " docName: " + docName + " userId: " + userId);
  console.log("llegado al delete pdf para doc nombre " + docName);

  //------------------------------------------------

  console.log("llegado al delete pdf puro");
  const pathDelete = CARPETAPDF + "/" + userId + "/" + docName + "_" + initialTimestampName + ".pdf";

  const pathDeleteStamp = CARPETAPDF + "/" + userId + "/" + docName + "_" + initialTimestampName + "-stamp" + '.pdf';
  const pathDeleteSign = CARPETAPDF + "/" + userId + "/" + docName + "_" + initialTimestampName + "-sign" + '.pdf';

  if (fs.existsSync(pathDelete)) {
    // delete the file on server after it sends to client
    const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
    unlinkFile(pathDelete);
  }

  if (fs.existsSync(pathDeleteStamp)) {
    // delete the file on server after it sends to client
    const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
    unlinkFile(pathDeleteStamp);
  }

  if (fs.existsSync(pathDeleteSign)) {
    // delete the file on server after it sends to client
    const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
    unlinkFile(pathDeleteSign);
  }

  //-----------------------------------------------

  console.log("delete pdf from bbdd!");

  let con;

  con = mysql.createConnection({
        host: DBHOST,
        user: DBUSER,
        password: DBPASS,
        port     :DBPORT,
        database: DBNAME
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

    let sql = "DELETE FROM pdfs WHERE id = ?";

    let values = [
      [id]
    ]

    con.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log("1 record deleted");
      console.log(result);

      console.log("Ending connection");
      con.end();

      res.json(result);
    });
    
  });

})


// Validation endpoint: only FIRMA role can validate a PDF.
app.put('/pdfs/:id/validate', async (req, res) => {
  const { id } = req.params;
  const actionRaw = (req.body && req.body.action) ? String(req.body.action) : 'VALIDATE';
  const action = actionRaw.toUpperCase().trim(); // expected 'VALIDATE'

  // Validator identity must be provided in headers
  const headerUserId = req.headers['x-user-id'];
  const headerUserRoleRaw = req.headers['x-user-role'];
  const headerUserRole = headerUserRoleRaw ? String(headerUserRoleRaw).toUpperCase().trim() : null;

  if (!headerUserId || !headerUserRole) return res.status(401).json({ error: 'validator identity required (x-user-id and x-user-role headers)' });
  if (headerUserRole !== 'FIRMA') return res.status(403).json({ error: 'only FIRMA role can validate' });

  // fetch pdf metadata from DB
  const con = mysql.createConnection({
    host: DBHOST,
    user: DBUSER,
    password: DBPASS,
    port: DBPORT,
    database: DBNAME
  });

  con.connect(function(err) {
    if (err) { console.error('DB connect error:', err); return res.status(500).json({ error: 'database connection error' }); }

    con.query('SELECT * FROM pdfs WHERE id = ?', [[id]], async function(err, result){
      if (err) { console.error('DB select error:', err); return res.status(500).json({ error: 'database query error' }); }
      const rows = Object.values(JSON.parse(JSON.stringify(result)));
      if(!rows || rows.length === 0) return res.status(404).json({ error: 'pdf not found' });

      const row = rows[0];
      const filePath = row.urlCarpeta || (CARPETAPDF + '/' + row.name + '.pdf');

      if(!fs.existsSync(filePath)) return res.status(400).json({ error: 'file missing on server' });

      try{
        const buffer = fs.readFileSync(filePath);
        const currentHash = crypto.createHash('sha256').update(buffer).digest('hex');

        // Check integrity
        if(!row.sha256 || row.sha256 !== currentHash){
          return res.status(400).json({ error: 'file integrity check failed (hash mismatch)' });
        }

        // Check modification time: prevent validation if file changed after upload
        const stats = fs.statSync(filePath);
        const mtimeMs = stats.mtimeMs;
        const uploadTsMs = row.uploadTimestamp ? new Date(row.uploadTimestamp).getTime() : null;
        if(uploadTsMs && mtimeMs > uploadTsMs + 1000){
          return res.status(400).json({ error: 'file was modified after upload; validation prevented' });
        }

        // determine state value (always VALIDATED here)
        const newEstado = 'VALIDATED';
        const validationTimestamp = new Date();

        const updateSql = `UPDATE pdfs SET estado = ?, validatorId = ?, validationTimestamp = ? WHERE id = ?`;
        const params = [newEstado, headerUserId, validationTimestamp, id];

        con.query(updateSql, params, function(err, updateResult){
          if(err){ console.error('DB update error:', err); return res.status(500).json({ error: 'database update error' }); }
          return res.json({ success: true, estado: newEstado, validatorId: headerUserId, validationTimestamp });
        });

      }catch(err){
        console.error('validation error:', err);
        return res.status(500).json({ error: 'validation failed' });
      }
    });
  });

});

// Explicit rejection endpoint: forces REJECTED state (only FIRMA role)
app.put('/pdfs/:id/reject', async (req, res) => {
  const { id } = req.params;

  // Validator identity must be provided in headers (normalize role)
  const headerUserId = req.headers['x-user-id'];
  const headerUserRoleRaw = req.headers['x-user-role'];
  const headerUserRole = headerUserRoleRaw ? String(headerUserRoleRaw).toUpperCase().trim() : null;

  if (!headerUserId || !headerUserRole) return res.status(401).json({ error: 'validator identity required (x-user-id and x-user-role headers)' });
  if (headerUserRole !== 'FIRMA') return res.status(403).json({ error: 'only FIRMA role can reject' });

  // fetch pdf metadata from DB
  const con = mysql.createConnection({
    host: DBHOST,
    user: DBUSER,
    password: DBPASS,
    port: DBPORT,
    database: DBNAME
  });

  con.connect(function(err) {
    if (err) { console.error('DB connect error:', err); return res.status(500).json({ error: 'database connection error' }); }

    con.query('SELECT * FROM pdfs WHERE id = ?', [[id]], async function(err, result){
      if (err) { console.error('DB select error:', err); return res.status(500).json({ error: 'database query error' }); }
      const rows = Object.values(JSON.parse(JSON.stringify(result)));
      if(!rows || rows.length === 0) return res.status(404).json({ error: 'pdf not found' });

      const row = rows[0];
      const filePath = row.urlCarpeta || (CARPETAPDF + '/' + row.name + '.pdf');

      if(!fs.existsSync(filePath)) return res.status(400).json({ error: 'file missing on server' });

      try{
        const buffer = fs.readFileSync(filePath);
        const currentHash = crypto.createHash('sha256').update(buffer).digest('hex');

        // Check integrity
        if(!row.sha256 || row.sha256 !== currentHash){
          return res.status(400).json({ error: 'file integrity check failed (hash mismatch)' });
        }

        // Check modification time: prevent rejection if file changed after upload
        const stats = fs.statSync(filePath);
        const mtimeMs = stats.mtimeMs;
        const uploadTsMs = row.uploadTimestamp ? new Date(row.uploadTimestamp).getTime() : null;
        if(uploadTsMs && mtimeMs > uploadTsMs + 1000){
          return res.status(400).json({ error: 'file was modified after upload; rejection prevented' });
        }

        const newEstado = 'REJECTED';
        const validationTimestamp = new Date();

        const updateSql = `UPDATE pdfs SET estado = ?, validatorId = ?, validationTimestamp = ? WHERE id = ?`;
        const params = [newEstado, headerUserId, validationTimestamp, id];

        con.query(updateSql, params, function(err, updateResult){
          if(err){ console.error('DB update error:', err); return res.status(500).json({ error: 'database update error' }); }
          return res.json({ success: true, estado: newEstado, validatorId: headerUserId, validationTimestamp });
        });

      }catch(err){
        console.error('rejection error:', err);
        return res.status(500).json({ error: 'rejection failed' });
      }
    });
  });
});

app.put('/modify-pdf/:id', fileUpload(), async (req, res) => {

  console.log("llegado al modify-pdf" + req.body.estado);
  console.log(req.files);

  const { id } = req.params;

  const nombreFileNuevo = req.body.filename;
  const nombreFileOriginal = req.body.filenameOriginal;

  const initialTimestampName = req.body.initialTimestampName;

  var estado = req.body.estado || 'PENDING';

  const userIdNuevo = req.body.userIdNuevo;
  const userIdOriginal = req.body.userIdOriginal;

  const archivoNombreNuevo = CARPETAPDF + "/" + userIdNuevo + "/" + nombreFileNuevo + "_" + initialTimestampName + '.pdf';
  const archivoNombreOriginal = CARPETAPDF + "/" + userIdOriginal + "/" + nombreFileOriginal + "_" + initialTimestampName + '.pdf';


  const pathStampOriginal = CARPETAPDF + "/" + userIdOriginal + "/" + nombreFileOriginal + "_" + initialTimestampName + "-stamp" + '.pdf';
  const pathSignOriginal = CARPETAPDF + "/" + userIdOriginal + "/" + nombreFileOriginal + "_" + initialTimestampName + "-sign" + '.pdf';

  const pathStampNuevo = CARPETAPDF + "/" + userIdNuevo + "/" + nombreFileNuevo + "_" + initialTimestampName + "-stamp" + '.pdf';
  const pathSignNuevo = CARPETAPDF + "/" + userIdNuevo + "/" + nombreFileNuevo + "_" + initialTimestampName + "-sign" + '.pdf';
  
  var pdfFile = (req.files && req.files.uploadedFile) ? req.files.uploadedFile : null;

  console.log(id, archivoNombreNuevo, archivoNombreOriginal, nombreFileOriginal, nombreFileNuevo, estado, userIdOriginal, userIdNuevo, !!pdfFile);

  try{
    const carpetaNombreNuevo = CARPETAPDF + "/" + userIdNuevo
    if (!fs.existsSync(carpetaNombreNuevo)){
      fs.mkdirSync(carpetaNombreNuevo);
    }

    if(pdfFile === null){
      // rename file
      if (fs.existsSync(archivoNombreOriginal)){

        fs.renameSync(archivoNombreOriginal, archivoNombreNuevo);
        console.log('The file has been re-named to: ' + archivoNombreNuevo);

        if(fs.existsSync(pathStampOriginal)){
          fs.renameSync(pathStampOriginal, pathStampNuevo);
        }

        if(fs.existsSync(pathSignOriginal)){
          fs.renameSync(pathSignOriginal, pathSignNuevo);
        }

      }else{
        console.warn('Original file not found for rename:', archivoNombreOriginal);
      }
    }  
    
    if(pdfFile !== null){
      // replace file
      if (fs.existsSync(archivoNombreOriginal)) {
        const unlinkFile = util.promisify(fs.unlink);
        await unlinkFile(archivoNombreOriginal);       
      }

      if(fs.existsSync(pathStampOriginal)){
        const unlinkFile = util.promisify(fs.unlink);
        await unlinkFile(pathStampOriginal);
      }

      if(fs.existsSync(pathSignOriginal)){
        const unlinkFile = util.promisify(fs.unlink);
        await unlinkFile(pathSignOriginal);
      }

      fs.writeFileSync(archivoNombreNuevo, pdfFile.data);
      console.log('File written successfully:', archivoNombreNuevo);

      estado = 'PENDING';
    }

    // compute metadata for the new file
    const metadata = await computePdfMetadata(archivoNombreNuevo);

    //-----------------------------------
    con = mysql.createConnection({
            host: DBHOST,
            user: DBUSER,
            password: DBPASS,
            port     :DBPORT,
            database: DBNAME
      });

    con.connect(function(err) {
      if (err) {
        console.error('DB connect error:', err);
        return res.status(500).json({ error: 'database connection error' });
      }
      console.log("Connected!");

      // Format uploadTimestamp for MySQL DATETIME
      //const uploadTs = metadata.uploadTimestamp.toISOString().slice(0, 19).replace('T', ' ');

      const uploadTs = new Date(Date.now() + 1 * (60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');

      let sql = `
        UPDATE pdfs 
        SET userId = "${userIdNuevo}", 
        name = "${nombreFileNuevo}",
        urlCarpeta = "${archivoNombreNuevo}",
        estado = "${estado}",
        fileSize = ${metadata.fileSize},
        numPages = ${metadata.numPages},
        sha256 = "${metadata.sha256}",
        uploadTimestamp = "${uploadTs}"
        WHERE id = "${id}"
      `;
      con.query(sql, function (err, result) {
        if (err) {
          console.error('DB update error:', err);

          console.log("Ending connection");
          con.end();

          return res.status(500).json({ error: 'database update error' });
        }
        console.log("1 record modified");
        console.log(result);

        console.log("Ending connection");
        con.end();

        res.json(result);
      });

    })
  }catch(err){
    console.error('modify-pdf error:', err);

    console.log("Ending connection");
    con.end();

    return res.status(500).json({ error: 'failed to modify pdf' });
  }
})



//--------------------------------------------------------------------
//--------------------------------------------------------------------
//--------------------------------------------------------------------
//--------------------------------------------------------------------



app.get("/pdfStamp/:id", cors(), (req, res) => {

  //console.log("get pdf by id!");

  let connection;
  var resultRows;
  const { id } = req.params;

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;

          //var sql = "SELECT id, userId, name, urlCarpeta FROM pdfs WHERE id = ?";
          var queryBusqueda = "SELECT pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, nameUser, estado, DATE_ADD(initialUploadTimestamp, INTERVAL 1 HOUR) as initialUploadTimestamp, userId, stampUserId, DATE_ADD(stampTimestamp, INTERVAL 1 HOUR) as stampTimestamp, IF(atr IS NULL,0,1) AS atrexists FROM pdfs INNER JOIN users ON pdfs.stampUserId = users.id WHERE pdfs.id = ?"

          let values = [
            [id]
          ]

          connection.query(queryBusqueda,[values], function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));

              //console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");

      console.log("Ending connection");
      connection.end();
  }

});

app.put('/stamp/:id', async (req, res) => {

  console.log("llegado al stamp");
  console.log(req.body);

  const { id } = req.params;
  const { filename, stampUserId, originalUserId, initialTimestampName, addTimeStamp} = req.body;

  const archivoPdf = CARPETAPDF + "/" + originalUserId + "/" + filename + "_" + initialTimestampName + '.pdf';

  const archivoStampPNG = CARPETASTAMP + "/" + stampUserId + '.png';
  const archivoStampJPG = CARPETASTAMP + "/" + stampUserId + '.jpg';
  const archivoStampJPEG = CARPETASTAMP + "/" + stampUserId + '.jpeg';

  var stampTimestamp = new Date(Date.now() + 1 * (60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');

  const newFilePath = CARPETAPDF + "/" + originalUserId + "/" + filename + "_" + initialTimestampName + "-stamp" + '.pdf';

  if (fs.existsSync(archivoPdf) && !fs.existsSync(newFilePath) && (fs.existsSync(archivoStampPNG) || fs.existsSync(archivoStampJPG) || fs.existsSync(archivoStampJPEG))){

    console.log(id, addTimeStamp, archivoPdf, stampUserId, archivoStampPNG, archivoStampJPG, archivoStampJPEG);

    //-------------------------------------------------------------------

    //-------------------------------------------------
    try{
      con = mysql.createConnection({
            host: DBHOST,
            user: DBUSER,
            password: DBPASS,
            port     :DBPORT,
            database: DBNAME
      });

      con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");

      let sql = `
        UPDATE pdfs 
        SET stampUserId = "${stampUserId}",
        stampTimestamp = "${stampTimestamp}" 
        WHERE id = "${id}"
      `;

      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record modified");
        console.log(result);

        console.log("Ending connection");
        con.end();

      });
      })
    }catch(err){
      console.error('stamp-pdf error:', err);

      console.log("Ending connection");
      con.end();

      return res.status(500).json({ error: 'failed to stamp pdf' });
    }


    //-------------------------------------------------------------------

    const pdfDoc = await PDFDocument.load(fs.readFileSync(archivoPdf));

    var img = null;
    if(fs.existsSync(archivoStampPNG)){
      img = await pdfDoc.embedPng(fs.readFileSync(archivoStampPNG));
    }
    
    if(fs.existsSync(archivoStampJPG)){
      img = await pdfDoc.embedJpg(fs.readFileSync(archivoStampJPG));
    }

    if(fs.existsSync(archivoStampJPEG)){
      img = await pdfDoc.embedJpg(fs.readFileSync(archivoStampJPEG));
    }

    /*const imagePage = pdfDoc.insertPage(0);
    imagePage.drawImage(img, {
      x: 0,
      y: 0,
      width: imagePage.getWidth(),
      height: imagePage.getHeight()
    });*/

    if(img !== null){
      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        var page = pdfDoc.getPage(i);

        var dims = img.scale(0.5);
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        page.drawImage(img, {
            //x: page.getWidth() / 2 - dims.width / 2 + 75,
            //y: page.getHeight() / 2 - dims.height + 250,
            x: 5,
            y: page.getHeight() - 200,
            width: dims.width,
            height: dims.height,
        })

        //console.log("insertando timestamp al pdf " + stampTimestamp.toString());
        if(addTimeStamp === true){
          page.drawText(stampTimestamp.toString(), {
              x: 5,
              //y: page.getHeight() / 2 + 300,
              y: page.getHeight() - 220,
              size: 20,
              font: helveticaFont,
              color: rgb(0.95, 0.1, 0.1),
              //rotate: degrees(-45),
              opacity: 0.3,
          });
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    //const newFilePath = CARPETAPDF + "/" + filename + '-estampado.pdf';
    fs.writeFileSync(newFilePath, pdfBytes);

    console.log("Leyendo pdf: " + newFilePath);

    const rs = fs.createReadStream(newFilePath);

    // get size of the file
    const { size } = fs.statSync(newFilePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", size);

    console.log("Enviando pdf: " + newFilePath);

    rs.pipe(res);

  }else{
    console.warn('Pdf o Estampado no se han encontrado, o ya se ha estampado el pdf');
    return res.status(500).json({ error: 'failed to find pdf or stamp, or stamped pdf already exists' });

  }

})

app.delete('/eliminateDocStamp', async function(req, res) {

  const id = req.query.id;
  const docName = req.query.docName;
  const userId = req.query.userId;
  const initialTimestampName = req.query.initialTimestampName;

  if (!id || !docName || !userId || !initialTimestampName) {
    return res.status(400).json({ id: 'id, userid y docName son requeridos' });
  }

  //console.log("id: " + id + " docName: " + docName + " userId: " + userId);
  //console.log("llegado al delete pdf para doc nombre " + docName);

  //------------------------------------------------

  console.log("llegado al delete pdf stamp");
  const pathDelete = CARPETAPDF + "/" + userId + "/" + docName + "_" + initialTimestampName + "-stamp" + ".pdf";
  console.log("ruta: " + pathDelete);

  if (fs.existsSync(pathDelete)) {
    // delete the file on server after it sends to client
    const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
    unlinkFile(pathDelete);
  }

  //----------------------------------
  try{
    con = mysql.createConnection({
            host: DBHOST,
            user: DBUSER,
            password: DBPASS,
            port     :DBPORT,
            database: DBNAME
      });

    con.connect(function(err) {
      if (err) {
        console.error('DB connect error:', err);
        return res.status(500).json({ error: 'database connection error' });
      }
      console.log("Connected!");

      var stampUserId = null;
      var stampTimestamp = null;

      let sql = `
        UPDATE pdfs 
        SET stampUserId = "${stampUserId}", 
        stampTimestamp = "${stampTimestamp}"
        WHERE id = "${id}"
      `;
      con.query(sql, function (err, result) {
        if (err) {
          console.error('DB update error:', err);

          console.log("Ending connection");
          con.end();

          return res.status(500).json({ error: 'database update error' });
        }
        console.log("1 record modified");
        console.log(result);

        console.log("Ending connection");
        con.end();

        res.json(result);
      });

    })
  }catch(err){
    console.error('modify-pdf stamp error:', err);

    console.log("Ending connection");
    con.end();

    return res.status(500).json({ error: 'failed to modify stamp pdf' });
  }

})



//--------------------------------------------------------------------
//--------------------------------------------------------------------
//--------------------------------------------------------------------
//--------------------------------------------------------------------



app.get("/pdfSign/:id", cors(), (req, res) => {

  //console.log("get pdf by id!");

  let connection;
  var resultRows;
  const { id } = req.params;

  try {
      connection = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
      });

      connection.connect(function(err) {
          if (err) throw err;

          //var sql = "SELECT id, userId, name, urlCarpeta FROM pdfs WHERE id = ?";
          var queryBusqueda = "SELECT pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, nameUser, estado, DATE_ADD(initialUploadTimestamp, INTERVAL 1 HOUR) as initialUploadTimestamp, userId, signUserId, DATE_ADD(signTimestamp, INTERVAL 1 HOUR) as signTimestamp FROM pdfs INNER JOIN users ON pdfs.signUserId = users.id WHERE pdfs.id = ?"

          let values = [
            [id]
          ]

          connection.query(queryBusqueda,[values], function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));

              //console.log(resultRows);

              console.log("Ending connection");
              connection.end();

              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");

      console.log("Ending connection");
      connection.end();
  }

});


app.put('/sign/:id', fileUpload(), async (req, res) => {

  console.log("llegado al sign-pdf");
  console.log(req.files);

  const { id } = req.params;

  const fileName = req.body.filename;
  const signUserId = req.body.signUserId;
  const originalUserId = req.body.originalUserId;
  const initialTimestampName = req.body.initialTimestampName;

  const archivoPdf = CARPETAPDF + "/" + originalUserId + "/" + fileName + "_" + initialTimestampName + '.pdf';
  console.log(archivoPdf);
  var pdfFile = (req.files && req.files.uploadedFile) ? req.files.uploadedFile.data : null;

  const newFilePath = CARPETAPDF + "/" + originalUserId + "/" + fileName + "_" + initialTimestampName + "-sign" + '.pdf';

  if (fs.existsSync(archivoPdf) && pdfFile !== null && !fs.existsSync(newFilePath)){

    console.log(id, archivoPdf, signUserId);

    //-----------------------------------------------------------------

    try{
      con = mysql.createConnection({
            host: DBHOST,
            user: DBUSER,
            password: DBPASS,
            port     :DBPORT,
            database: DBNAME
      });

      con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");

      const signTimestamp = new Date(Date.now() + 1 * (60 * 60 * 1000) ).toISOString().slice(0, 19).replace('T', ' ');

      let sql = `
        UPDATE pdfs 
        SET signUserId = "${signUserId}",
        signTimestamp = "${signTimestamp}" 
        WHERE id = "${id}"
      `;

      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record modified");
        console.log(result);

        console.log("Ending connection");
        con.end();
      });
      })
    }catch(err){
      console.error('sign-pdf error:', err);

      console.log("Ending connection");
      con.end();

      return res.status(500).json({ error: 'failed to sign pdf' });
    }

    //-------------------------------------------------------------------

    fs.writeFileSync(newFilePath, pdfFile);

    console.log("Leyendo pdf: " + newFilePath);

    //const rs = fs.createReadStream(newFilePath);

    // get size of the file
    /*const { size } = fs.statSync(newFilePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", size);

    console.log("Enviando pdf: " + newFilePath);

    rs.pipe(res);*/

    return res.status(200).json({ data: 'pdf signed' });

  }else{
    console.warn('Pdf no se ha encontrado o ya se ha firmado');
    return res.status(500).json({ error: 'failed to find pdf or signed pdf already exists' });

  }

})

app.delete('/eliminateDocSign', async function(req, res) {

  const id = req.query.id;
  const docName = req.query.docName;
  const userId = req.query.userId;
  const initialTimestampName = req.query.initialTimestampName;

  if (!id || !docName || !userId || !initialTimestampName) {
    return res.status(400).json({ id: 'id, userid y docName son requeridos' });
  }

  //console.log("id: " + id + " docName: " + docName + " userId: " + userId);
  //console.log("llegado al delete pdf para doc nombre " + docName);

  //------------------------------------------------

  console.log("llegado al delete pdf sign");
  const pathDelete = CARPETAPDF + "/" + userId + "/" + docName + "_" + initialTimestampName + "-sign" + ".pdf";
  console.log("ruta: " + pathDelete);

  if (fs.existsSync(pathDelete)) {
    // delete the file on server after it sends to client
    const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
    unlinkFile(pathDelete);
  }

  //----------------------------------
  try{
    con = mysql.createConnection({
            host: DBHOST,
            user: DBUSER,
            password: DBPASS,
            port     :DBPORT,
            database: DBNAME
      });

    con.connect(function(err) {
      if (err) {
        console.error('DB connect error:', err);

        console.log("Ending connection");
        con.end();

        return res.status(500).json({ error: 'database connection error' });
      }
      console.log("Connected!");

      var signUserId = null;
      var signTimestamp = null;

      let sql = `
        UPDATE pdfs 
        SET signUserId = "${signUserId}", 
        signTimestamp = "${signTimestamp}"
        WHERE id = "${id}"
      `;
      con.query(sql, function (err, result) {
        if (err) {
          console.error('DB update error:', err);

          console.log("Ending connection");
          con.end();

          return res.status(500).json({ error: 'database update error' });
        }
        console.log("1 record modified");
        console.log(result);

        console.log("Ending connection");
        con.end();

        res.json(result);
      });

    })
  }catch(err){
    console.error('modify-pdf sign error:', err);

    console.log("Ending connection");
    con.end();

    return res.status(500).json({ error: 'failed to modify sign pdf' });
  }

})  



//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------

app.get("/get-stamp/:id", cors(), (req, res) => {

  const { id } = req.params;
  console.log("llegado al get-stamp: " + id);

  const archivoStampPNG = CARPETASTAMP + "/" + id + '.png';
  //const archivoStampJPG = CARPETASTAMP + "/" + stampUserId + '.jpg';
  //const archivoStampJPEG = CARPETASTAMP + "/" + stampUserId + '.jpeg';

  if(fs.existsSync(archivoStampPNG)){

    const rs = fs.createReadStream(archivoStampPNG);

    // get size of the file
    const { size } = fs.statSync(archivoStampPNG);
    res.setHeader("Content-Type", "application/png");
    res.setHeader("Content-Length", size);

    console.log("Enviando stamp imagen: " + archivoStampPNG);

    rs.pipe(res);
  }else{
    return res.status(204).json({ info: 'There is no stamp' });
  }

});



app.post('/create-stamp', fileUpload(), async (req, res) => {

  console.log("llegado al create-stamp"); 
  const stampFile = req.files && req.files.uploadedFile ? req.files.uploadedFile : null;
  const nombreFile = req.body.userId;
  const fileType = req.body.fileType;
  
  //const estado = req.body.estado;
  const archivoNombre = CARPETASTAMP + "/" + nombreFile + fileType;

  if(!stampFile){
    return res.status(400).json({ error: 'No uploadedFile provided' });
  }

  const nombreFileJpg =  CARPETASTAMP + "/" + nombreFile + ".jpg";
  const nombreFileJpeg =  CARPETASTAMP + "/" + nombreFile + ".jpeg";
  const nombreFilePng =  CARPETASTAMP + "/" + nombreFile + ".png";

  if (fs.existsSync(nombreFileJpg) || fs.existsSync(nombreFilePng) || fs.existsSync(nombreFileJpeg)){
    return res.status(400).json({ error: 'File already exists' });
  }

  try{
    await fs.writeFileSync(archivoNombre, stampFile.data);

    if((fileType === ".jpg")||(fileType === ".jpeg")){
      var transformFileName = CARPETASTAMP + "/" + nombreFile;
      await transformStampType(transformFileName, fileType);
    }

    await modifyImage(nombreFilePng);
    //await modifyImageTransparent(archivoNombre);
    console.log('File written successfully', nombreFilePng);
    return res.status(200).json({ resultData: 'File written successfully' });
  }catch(err){
    console.error('create-stamp error:', err);
    return res.status(500).json({ error: 'failed to save or process stamp' });
  }
});

app.delete('/delete-stamp', async function(req, res) {

  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({error:'userid son requeridos'});
  }

  const nombreFileJpg =  CARPETASTAMP + "/" + userId + ".jpg";
  const nombreFileJpeg =  CARPETASTAMP + "/" + userId + ".jpeg";
  const nombreFilePng =  CARPETASTAMP + "/" + userId + ".png";

  if (!fs.existsSync(nombreFileJpg) && !fs.existsSync(nombreFilePng) && !fs.existsSync(nombreFileJpeg)){
    return res.status(400).json({ error: 'File does not exists' });
  }else{

    const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
    if(fs.existsSync(nombreFileJpg)){
      await unlinkFile(nombreFileJpg);
    }
    if(fs.existsSync(nombreFileJpeg)){
      await unlinkFile(nombreFileJpeg);
    }
    if(fs.existsSync(nombreFilePng)){
      await unlinkFile(nombreFilePng);
    }
    return res.status(200).json({ responseData: 'stamp deleted' });
  }

})  


async function modifyImage(imageName){
  console.log("Iniciado modificacion de stamp");

  // open a file called "lenna.png"
  const image = await Jimp.read(imageName);

  //image.resize(256, 256); // resize
  /*await image.opacity(0.3, function(err){
      if (err) throw err;
  })*/

  const MAX_WIDTH = 256;
  try {
    console.log("Checking size: " + image.bitmap + " " + image.bitmap.width + " " + image.bitmap.width);
    if (image.bitmap && image.bitmap.width && image.bitmap.width > MAX_WIDTH) {
      console.log("Resizing 256...");
      //await image.resize(MAX_WIDTH, Jimp.AUTO);
      //await image.resize({ width: 100 });
      //await image.resize(256, 256);
      image.resize({ w: MAX_WIDTH});
    }
  } catch (e) {
    console.warn('resizeAndWriteImage: resize failed', e && e.stack ? e.stack : e);
  }

  await image.opacity(0.3);

  await image.write(imageName); // save

  console.log("Finalizado modificacion de stamp");
}

async function transformStampType(fileName, fileType){

  originalFile = fileName + fileType;
  pngFile = fileName + ".png";

  console.log("Iniciando transformacion del tipo de archivo " + originalFile.toString() + " " + pngFile.toString());

  //We will first read the JPG image using read() method.
  if (fs.existsSync(originalFile)) { 
    const image = await Jimp.read(originalFile.toString());
    await image.write(pngFile.toString());

    // delete the file on server after it sends to client
    const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
    await unlinkFile(originalFile);
  }

  console.log("archivo transformado " + pngFile.toString());
  console.log("finalizado transformacion del tipo de archivo");
}

//--------------------------------------
//--------------------------------------
//--------------------------------------

app.put('/lecturaTarjeta', async (req, res) => {

  console.log("llegado al lectura del tarjeta");

  const idUser = req.body.fdUserId;

  console.log(" ID User: " + idUser);

  var userArray = await insertSmartCardInfo(idUser);

  return res.status(200).json({ responseData: 'lectura de tarjetas' });

  
}) 

app.put('/firmadoDigital/:id', async (req, res) => {

  console.log("llegado al firmado digital pdf");

  const { id } = req.params;
  const idUserFirmadoDigital = req.body.fdUserId;

  await compareSmartCardInfo(idUserFirmadoDigital, id);

  return res.status(200).json({ responseData: 'hecho firma' });
  
}) 

app.post('/sign/prepare/:id', async (req, res) => {
    const { id } = req.params;
    //const { userId, fileName, initialTimestampName } = req.body;

    //console.log(id + " - " + userId + " - " + fileName + " - " + initialTimestampName);

    if (!id) {
        return res.status(400).json({ error: 'id son requeridos' });
    }

    var existe = false;
    let con;

    listaDocs = [];

    con = mysql.createConnection({
          host: DBHOST,
          user: DBUSER,
          password: DBPASS,
          port     :DBPORT,
          database: DBNAME
    });

    let sql = `
      select urlCarpeta, stampUserId from pdfs 
      WHERE id = "${id}"
    `;
  try{
    await con.promise().query(sql)
        .then( ([rows,fields]) => {

            var rowsObjectString = JSON.stringify(rows);
            if(rowsObject !== null && rowsObject !== ""){
              var rowsObject = JSON.parse(rowsObjectString.toString())

              if(rowsObject.length > 0){
                console.log("Docs existe");
                existe = true;

                for (let i = 0; i < rowsObject.length; i++){
                  listaDocs.push(JSON.parse(JSON.stringify(rowsObject[i])));
                }
              }else{
                console.log("Docs no existe");
                existe = false;
                return;
              }
            }else{
              console.log("Docs no existe");
              existe = false;
              return;

            }
        })
  }catch(error){
    console.log(error);

    console.log("Ending connection");
    con.end();
  }

  if(existe === true){

    if(listaDocs !== null && listaDocs.length > 0){

    console.log(listaDocs);

    for (let i = 0; i < listaDocs.length; i++) {
      //var doc = JSON.parse(listaDocs[i]);
      var doc = listaDocs[i];

      if(Object.hasOwn(doc, "urlCarpeta") && Object.hasOwn(doc, "stampUserId")){

        var urlCarpetaOriginal = doc.urlCarpeta;
        var stampUserId = doc.stampUserId;
        //var signUserId = doc.signUserId;

        urlCarpetaOriginal = urlCarpetaOriginal.slice(0,-4);
        //var urlCarpetaSigned = urlCarpetaOriginal + "-sign" + ".pdf";
        var urlCarpetaStamped = urlCarpetaOriginal + "-stamp" + ".pdf";
      }
    }
  }        

    const archivoPdf = urlCarpetaStamped;

    if (!fs.existsSync(archivoPdf)) {
        return res.status(404).json({ error: 'PDF no encontrado' });
    }

    try {
        // Leer el original
        const pdfBytes = fs.readFileSync(archivoPdf);

        const hash = crypto.createHash('sha256').update(pdfBytes).digest('base64');

        console.log(`PDF ${archivoPdf} preparado para firma. Hash generado.`);

        // TODO CAMBIAR ESTADO EN LA DB? 

        return res.status(200).json({
            message: 'PDF preparado para firma digital',
            pdfId: id,
            hash: hash,
            hashFunction: 'SHA-256'

        });

    } catch (err) {
        console.error('Error preparando PDF para Web eID:', err);
        return res.status(500).json({ error: 'failed to prepare PDF for digital signing' });
    }
  }   

});

const forge = require('node-forge'); //TODO moverlo junto a las otras depedencias
app.post('/sign/finalize/:id', async (req, res) => {
  const { id } = req.params;
  const { signature, signatureAlgorithm, certificate } = req.body;

  console.log(id + " - " + signature + " - " + signatureAlgorithm + " - " + certificate);

  if (!signature || !signatureAlgorithm || !certificate) {
    return res.status(400).json({ error: 'signature, signatureAlgorithm y certificate son requeridos' });
  }

  const con = mysql.createConnection({
    host: DBHOST,
    user: DBUSER,
    password: DBPASS,
    port: DBPORT,
    database: DBNAME
  });

  con.connect(async (err) => {
    if (err) return res.status(500).json({ error: 'DB connection error' });

    try {
      const [rows] = await con.promise().query(`SELECT name, userId, initialUploadTimestamp, urlCarpeta FROM pdfs WHERE id = ?`, [id]);
      if (!rows || rows.length === 0) {
        con.end();
        return res.status(404).json({ error: 'PDF not found' });
      }

      const pdfData = rows[0];
      //const archivoPdf = `${CARPETAPDF}/${pdfData.userId}/${pdfData.name}_${pdfData.initialUploadTimestamp}-stamp.pdf`;
      const archivoPdfOriginal = pdfData.urlCarpeta;

      var urlCarpetaOriginal = archivoPdfOriginal.slice(0,-4);
      //var urlCarpetaSigned = urlCarpetaOriginal + "-sign" + ".pdf";
      var archivoPdf = urlCarpetaOriginal + "-stamp" + ".pdf";

      console.log(archivoPdf);
      if (!fs.existsSync(archivoPdf)) {
        con.end();
        return res.status(404).json({ error: 'PDF file not found' });
      }

      const pdfBytes = fs.readFileSync(archivoPdf);

      const md = forge.md.sha256.create();
      md.update(pdfBytes.toString('binary'));

      const sigBytes = forge.util.decode64(signature);
      //const cert = forge.pki.certificateFromPem(certificate);

      const certDer = forge.util.decode64(certificate);
      const certAsn1 = forge.asn1.fromDer(certDer);
      const cert = forge.pki.certificateFromAsn1(certAsn1);

      let verified = false;
      try {
        verified = cert.publicKey.verify(md.digest().getBytes(), sigBytes);
      } catch (e) {
        console.error('Signature verification error', e);
      }

      if (!verified) {
        con.end();
        return res.status(400).json({ error: 'Firma no válida' });
      }

      // Guardar PDF firmado
      const newFilePath = urlCarpetaOriginal + "-signFD.pdf";
      console.log(newFilePath);
      fs.writeFileSync(newFilePath, pdfBytes);

      //TODO actualizar estado en la DB?
      // const signTimestamp = new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
      // await con.promise().query(
      //   `UPDATE pdfs SET signUserId = ?, signTimestamp = ?, estado = "VALIDATED" WHERE id = ?`,
      //   [pdfData.userId, signTimestamp, id]
      // );

      con.end();
      return res.status(200).json({ message: 'PDF firmado correctamente', file: newFilePath });

    } catch (error) {
      console.error(error);
      con.end();
      return res.status(500).json({ error: 'Error al procesar la firma' });
    }
  });
});


const challenges = {}; //Nonces

app.get("/auth/challenge", (req, res) => {
  const nonce = crypto.randomBytes(16).toString("hex");
  challenges[nonce] = true;

  res.json({ nonce });
});


app.post("/auth/login", (req, res) => {
  const { authToken } = req.body;

  if (!authToken) {
    return res.status(400).json({ error: "authToken missing" });
  }

  const { nonce, certificate, signature } = authToken;

  if (!nonce || !challenges[nonce]) {
    return res.status(400).json({ error: "Invalid or expired nonce" });
  }

  delete challenges[nonce];

  if (!certificate || !signature) {
    return res.status(400).json({ error: "Invalid token data" });
  }

  res.json({ success: true });
});


//-------------------------------
//------------------------------
//------------------------------
async function insertSmartCardInfo(idUser){

userArray = [];

var pcsc = require('pcsclite'); //pcsclite@1.0.1
var pcsc = pcsc();

pcsc.on('reader', function(reader) {

    console.log("pcsc reader...");

    console.log('New reader detected', reader.name);

    reader.on('error', function(err) {
        console.log('Error(', this.name, '):', err.message);
    });

    reader.on('status', async function(status) {

        console.log('Status(', this.name, '):', status);
        console.log("ATR: " + status.atr);

        var arrByte= new Uint8Array(status.atr)
        userArray = arrByte;
        console.log("pcsc reader... already read card: " + userArray);

        let con;

        if(userArray !== null && userArray.length > 0){

          con = mysql.createConnection({
                host: DBHOST,
                user: DBUSER,
                password: DBPASS,
                port     :DBPORT,
                database: DBNAME
          });

          arrayEncrypt = encrypt(userArray.toString());

          let sql = `
            UPDATE Users 
            SET atr = "${arrayEncrypt}" 
            WHERE id = "${idUser}"
          `;

          console.log("sql: " + sql);

          try{
            await con.promise().query(sql)
            .then( ([rows,fields]) => {

              console.log("Ending connection");
              con.end();
          })
          }catch(error){
            console.log(error);

            console.log("Ending connection");
            con.end();
          }

          //Anhadido a posteriori
          reader.close();
          pcsc.close();

        }

        // check what has changed
        var changes = this.state ^ status.state;
        if (changes) {
            if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
                console.log("card removed");// card removed
                reader.disconnect(reader.SCARD_LEAVE_CARD, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Disconnected');
                    }
                });
            } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
                console.log("card inserted");// card inserted
                reader.connect({ share_mode : this.SCARD_SHARE_SHARED }, function(err, protocol) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Protocol(', reader.name, '):', protocol);
                        reader.transmit(Buffer.from([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol, function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Data received', data);
                                reader.close();
                                pcsc.close();
                            }
                        });
                    }
                });
            }
        }
    });

    reader.on('end', function() {
        console.log('Reader',  this.name, 'removed');
    });
});

pcsc.on('error', function(err) {
    console.log('PCSC error', err.message);
});


return userArray;


}

async function compareSmartCardInfo(idUserFirmadoDigital, idPdf){

userArray = [];

var pcsc = require('pcsclite'); //pcsclite@1.0.1
var pcsc = pcsc();

pcsc.on('reader', function(reader) {

    console.log("pcsc reader...");

    console.log('New reader detected', reader.name);

    reader.on('error', function(err) {
        console.log('Error(', this.name, '):', err.message);
    });

    reader.on('status', async function(status) {

        console.log('Status(', this.name, '):', status);
        console.log("ATR: " + status.atr);

        var arrByte= new Uint8Array(status.atr)
        userArray = arrByte;
        console.log("pcsc reader... already read card: " + userArray);

        var existe = false;
        let con;

        con = mysql.createConnection({
              host: DBHOST,
              user: DBUSER,
              password: DBPASS,
              port     :DBPORT,
              database: DBNAME
        });

        let sqlUserAtr = `
          Select atr from Users 
          WHERE id = "${idUserFirmadoDigital}"
        `;

        console.log("sql: " + sqlUserAtr);

        try{

          await con.promise().query(sqlUserAtr)
          .then( ([rows,fields]) => {

            var rowsObjectString = JSON.stringify(rows);
            if(rowsObject !== null && rowsObject !== ""){
              var rowsObject = JSON.parse(rowsObjectString.toString())

              if(rowsObject.length > 0){
                console.log("user existe");
                

                var jsonObject = JSON.parse(JSON.stringify(rowsObject[0]))

                atrDecript = decrypt(jsonObject.atr);
                
                console.log(atrDecript);
                console.log(userArray.toString());

                if(atrDecript === userArray.toString()){
                  console.log("FIRMADO COINCIDE...");
                  existe = true;
                }


                
              }else{
                console.log("firmado no coincide");
                existe = false;
                return;
              }
            }else{
              console.log("firmado no coincide");
              existe = false;
              return;

            }
        })         
        }catch(error){
          console.log(error);

          console.log("Ending connection");
          con.end();

          //Anhadido a posteriori
          reader.close();
          pcsc.close();
        }

        if(existe !== true){

          console.log("No se ha firmado");
          console.log("Ending connection");
          con.end();

          //Anhadido a posteriori
          reader.close();
          pcsc.close();

        }else{

          /*con = mysql.createConnection({
              host: DBHOST,
              user: DBUSER,
              password: DBPASS,
              port     :DBPORT,
              database: DBNAME
          });*/

          let sqlPdfUrl = `
            UPDATE pdfs 
            SET estado = "VALIDATED"
            WHERE id = "${idPdf}"
          `;

          console.log("sql: " + sqlPdfUrl);

          try{
            await con.promise().query(sqlPdfUrl)
              .then( ([rows,fields]) => {

                console.log(JSON.stringify(rows));     

              })
          }catch(error){
            console.log(error);

            console.log("Ending connection");
            con.end();

            //Anhadido a posteriori
            reader.close();
            pcsc.close();
          }


          console.log("Ending connection");
          con.end();

          //Anhadido a posteriori
          reader.close();
          pcsc.close();
        }

        // check what has changed
        var changes = this.state ^ status.state;
        if (changes) {
            if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) {
                console.log("card removed");// card removed
                reader.disconnect(reader.SCARD_LEAVE_CARD, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Disconnected');
                    }
                });
            } else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
                console.log("card inserted");// card inserted
                reader.connect({ share_mode : this.SCARD_SHARE_SHARED }, function(err, protocol) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('Protocol(', reader.name, '):', protocol);
                        reader.transmit(Buffer.from([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol, function(err, data) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Data received', data);
                                reader.close();
                                pcsc.close();
                            }
                        });
                    }
                });
            }
        }
    });

    reader.on('end', function() {
        console.log('Reader',  this.name, 'removed');
    });
});

pcsc.on('error', function(err) {
    console.log('PCSC error', err.message);
});


return userArray;


}


function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

//-----------------------
// Endpoint to embed a PAdES signature using a provided P12 (preferred) or return info when PKCS#7 provided
app.put('/signPades/:id', (req, res) => {
  // Use express-fileupload as local middleware so global middleware is not required
  const fileUploadLocal = require('express-fileupload')();
  fileUploadLocal(req, res, async () => {
    try {
      const uploadedFile = req.files && req.files.uploadedFile;
      const p12file = req.files && req.files.p12file;
      const p12password = req.body && req.body.p12password ? req.body.p12password : '';
      const pkcs7 = req.body && req.body.pkcs7; // base64
      const certificate = req.body && req.body.certificate;
      const sigDict = req.body && req.body.sigDict ? JSON.parse(req.body.sigDict) : null;

      if (!uploadedFile) {
        return res.status(400).json({ error: 'uploadedFile (PDF) is required' });
      }

      const pdfBuffer = uploadedFile.data;

      // If client provided a P12, use node-signpdf to add placeholder and sign
      if (p12file) {
        try {
          const p12Buffer = p12file.data;
          const { plainAddPlaceholder, sign } = require('node-signpdf');

          // Add placeholder (signature field) if not present; use 8192 length or value from sigDict
          const placeholderLength = (sigDict && sigDict.ContentsLength) ? parseInt(sigDict.ContentsLength, 10) : 8192;

          const pdfWithPlaceholder = plainAddPlaceholder({ pdfBuffer, reason: (sigDict && sigDict.Reason) ? sigDict.Reason : 'Document signed', signatureLength: placeholderLength });

          const signedPdf = sign(pdfWithPlaceholder, p12Buffer, { passphrase: p12password });

          // Save signed PDF to CARPETAPDF if available, or return buffer
          const fileName = (req.body && req.body.filename) ? req.body.filename : ('signed-' + Date.now() + '.pdf');
          const outPath = CARPETAPDF ? path.join(CARPETAPDF, fileName) : null;
          if (outPath) {
            fs.writeFileSync(outPath, signedPdf);
          }

          return res.json({ status: 200, message: 'Signed PDF created', path: outPath ? outPath : null });
        } catch (err) {
          console.error('Error signing with P12:', err);
          return res.status(500).json({ error: 'Error signing with P12', details: err.message });
        }
      }

      // If PKCS#7 provided (client already built CMS), embed it directly into the PDF
      if (pkcs7) {
        try {
          const pkcs7Buf = Buffer.from(pkcs7, 'base64');
          const pkcs7Hex = pkcs7Buf.toString('hex').toUpperCase();

          // Decide placeholder length: use provided or ensure it's larger than actual pkcs7
          const placeholderLength = (sigDict && sigDict.ContentsLength) ? parseInt(sigDict.ContentsLength, 10) : Math.max(pkcs7Buf.length + 256, 8192);

          // Add placeholder into PDF so we can compute byte ranges reliably
          const { plainAddPlaceholder } = require('node-signpdf');
          const pdfWithPlaceholder = plainAddPlaceholder({ pdfBuffer, reason: (sigDict && sigDict.Reason) ? sigDict.Reason : 'Document signed', signatureLength: placeholderLength });

          // Work in latin1 to preserve raw bytes
          let pdfStr = pdfWithPlaceholder.toString('latin1');

          // Find the <...> hex placeholder for /Contents
          let contentsTag = '/Contents <';
          let idx = pdfStr.indexOf(contentsTag);
          if (idx === -1) contentsTag = '/Contents<', idx = pdfStr.indexOf(contentsTag);
          if (idx === -1) {
            return res.status(500).json({ error: 'Could not find /Contents placeholder in PDF' });
          }

          const hexStart = pdfStr.indexOf('<', idx) + 1;
          const hexEnd = pdfStr.indexOf('>', hexStart);
          if (hexStart === 0 || hexEnd === -1) {
            return res.status(500).json({ error: 'Malformed /Contents placeholder' });
          }

          const placeholderHexLength = hexEnd - hexStart;

          if (pkcs7Hex.length > placeholderHexLength) {
            return res.status(400).json({ error: 'PKCS#7 is larger than placeholder. Increase ContentsLength.' });
          }

          // Compute ByteRange values
          const placeholderStart = hexStart - 1; // include the '<' char position
          const placeholderEnd = hexEnd + 1; // include the '>'
          const pdfLen = Buffer.byteLength(pdfStr, 'latin1');
          const byteRange = [0, placeholderStart, placeholderEnd, pdfLen - placeholderEnd];

          // Replace numbers inside existing /ByteRange [ ... ] while preserving original spacing
          const brIdx = pdfStr.indexOf('/ByteRange [');
          if (brIdx === -1) {
            return res.status(500).json({ error: 'Could not find /ByteRange in PDF' });
          }
          const brEndIdx = pdfStr.indexOf(']', brIdx);
          const brContent = pdfStr.substring(brIdx, brEndIdx + 1);
          const newNums = [byteRange[0], byteRange[1], byteRange[2], byteRange[3]];
          let ni = 0;
          const newBrContent = brContent.replace(/(\d+)/g, function(m) {
            const v = String(newNums[ni++]);
            return v.padEnd(m.length, ' ');
          });
          pdfStr = pdfStr.slice(0, brIdx) + newBrContent + pdfStr.slice(brEndIdx + 1);

          // Insert PKCS#7 hex into placeholder and pad with zeros to preserve length
          const paddedSig = pkcs7Hex.padEnd(placeholderHexLength, '0');
          pdfStr = pdfStr.slice(0, hexStart) + paddedSig + pdfStr.slice(hexEnd);

          const finalBuffer = Buffer.from(pdfStr, 'latin1');

          // Save signed PDF
          const fileName = (req.body && req.body.filename) ? req.body.filename : ('signed-' + Date.now() + '.pdf');
          const outPath = CARPETAPDF ? path.join(CARPETAPDF, fileName) : null;
          if (outPath) fs.writeFileSync(outPath, finalBuffer);

          return res.json({ status: 200, message: 'PKCS#7 embedded, signed PDF created', path: outPath ? outPath : null });
        } catch (err) {
          console.error('Error embedding PKCS#7:', err);
          return res.status(500).json({ error: 'Error embedding PKCS#7', details: err.message });
        }
      }

      return res.status(400).json({ error: 'No signing material provided (p12file or pkcs7)' });
    } catch (err) {
      console.error('signPades error:', err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });
});

app.listen(APIPORT, () => {
  console.log(`Firma app listening at http://localhost:${APIPORT}`);
});

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}