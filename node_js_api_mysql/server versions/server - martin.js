const express = require('express');
const morgan = require('morgan');
var cors = require('cors');
const app = express();

/*const DBPORT=3306
const DBHOST="127.0.0.1"
const DBUSER="root"
const DBPASS=""
const DBNAME="prueba_movie"
const APIPORT=3000*/

//-------------------------------------------------

//dotenv nos permite leer las variables de entorno de nuestro .env
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

//---------------------------------------------------


//---------------------------------------------------    

app.set('view engine','ejs');
//app.use(express.json());
//app.use(express.static('public'));
app.use(morgan('dev'));
app.use(express.urlencoded({extended: true}));
app.use(cors());

//---------------------------------------------------
var bodyParser = require('body-parser');
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use(express.json({limit: '50mb'}));

//----------------------------------
const fs = require('fs');
const fileUpload = require('express-fileupload');
const util = require("util");
//----------------------------------
const crypto = require("crypto")
const pdfParse = require('pdf-parse');

const path = require('path');
const assert = require('assert');
const { PDFDocument } = require('pdf-lib');
const { degrees, rgb, StandardFonts } = require('pdf-lib');
let Jimp = require("jimp");
// Jimp da algun q otro error, por eso hago comprobaciones
if (Jimp) {
  if (typeof Jimp.read !== 'function') {
    if (Jimp.Jimp && typeof Jimp.Jimp.read === 'function') {
      Jimp = Jimp.Jimp;
    } else if (Jimp.default && typeof Jimp.default.read === 'function') {
      Jimp = Jimp.default;
    }
  }
}
//const gm = require('gm');

//---------------------------------

//const PDFParser = require('pdf-parse');

//const uploadDirectory = CARPETAPDF;
//const multer = require('multer');
//const path = require('path');
//const mammoth = require('mammoth');

//var multer = require('multer');
//var upload = multer({dest: uploadDirectory});


//const FormData = require('form-data');
//-------------------------------------------

/*const storage = multer.diskStorage({
       destination: (req, file, cb) => {
          cb(null, CARPETAPDF + '/');
       },
       filename: (req, file, cb) => {
          cb(null, file.originalname);
       }
});
const upload = multer({ storage });*/



// Function to process the file data (perform your file processing logic here)
/*function processFileData(fileData) {
  fs.writeFile('output.txt', fileData, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written successfully');
        }
      });
}*/


//------------------------------------


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



//------------------------------------
//------------------------------------
//------------------------------------
//------------------------------------



app.get("/movies", cors(), (req, res) => {

  console.log("get all movie!");

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
          
          connection.query("SELECT * FROM movies", function (err, result, fields) {
              if (err) throw err;
              
              console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));
              console.log(resultRows);
              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
  }

});

app.get("/get-movie/:id", async(req, res) => {

  console.log("get movie!");

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

    let sql = "SELECT *  from movies WHERE prodId = ?";

    let values = [
      [id]
    ]

    con.query(sql, [values], function (err, result, fields) {
        if (err) throw err;
        
        console.log(result);

        resultRows = Object.values(JSON.parse(JSON.stringify(result)));
        console.log(resultRows);
        res.json(resultRows);
    });
    
  });
    
});

app.post('/create-movie', (req, res) => {

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

    let sql = "INSERT INTO movies (prodId, price, quantity) VALUES ?";

    let values = [
      [req.body.prodId, req.body.price, req.body.quantity]
    ]

    con.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
      console.log(result);

      res.json(result);
    });
    
  });
});

app.delete('/delete-movie/:id', (req, res) => {

    console.log("delete movie!");

    let con;
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

    let sql = "DELETE FROM movies WHERE prodId = ?";

    let values = [
      [id]
    ]

    con.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log("1 record deleted");
      console.log(result);

      res.json(result);
    });
    
  });
});


app.put('/update-movie/:id', (req, res) => {

    console.log("update movie!");

    const { id } = req.params;
    const { price, quantity} = req.body;

    console.log(id + " - " + price + " - " + quantity);

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
      UPDATE movies 
      SET price = "${price}", 
      quantity = "${quantity}" 
      WHERE prodId = "${id}"
    `;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record modified");
      console.log(result);

      res.json(result);
    });
    
  });
});


//--------------------------
//--------------------------
//--------------------------
//--------------------------

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
          
          connection.query("SELECT * FROM users", function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));
              //console.log(resultRows);
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

          var sql = "SELECT * FROM users LIMIT 10";

          if(page > 1){
            sql = sql + " OFFSET " + ((page-1)*10);
          }
          console.log(sql);
          connection.query(sql, function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));
              //console.log(resultRows);
              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
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

    let sql = "SELECT *  from users WHERE id = ?";

    let values = [
      [id]
    ]

    con.query(sql, [values], function (err, result, fields) {
        if (err) throw err;
        
        //console.log(result);

        resultRows = Object.values(JSON.parse(JSON.stringify(result)));
        
        if(resultRows.length > 0){
          //console.log(resultRows);
          resultFinal = resultRows[0];
          //console.log(resultFinal);
          resultFinal.passUser = decrypt(resultFinal.passUser);
          //console.log(resultFinal);
          resultRows[0] = resultFinal;
        }

        res.json(resultRows);
    });
    
  });
});


app.post('/users', (req, res) => {
    // simple validation
    const { nameUser, emailUser, passUser, rolUser, encryptKeyUser } = req.body || {};
    if (!nameUser || nameUser.trim().length < 2) return res.status(400).json({ error: 'Nombre requerido (min 2 chars)' });
    if (!emailUser || !/^\S+@\S+\.\S+$/.test(emailUser)) return res.status(400).json({ error: 'Mail valido requerido' });
    if (!passUser || passUser.length < 6) return res.status(400).json({ error: 'Contraseña requerida (min 6 chars)' });
    const allowedRoles = ['ADMIN', 'CLIENT', 'FIRMA'];
    if (!rolUser || !allowedRoles.includes(rolUser)) return res.status(400).json({ error: 'Rol invalido' });

    passEncrypt = encrypt(passUser);

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

      const sql = 'INSERT INTO users (nameUser, emailUser, passUser, rolUser, encryptKeyUser) VALUES ?';
      const values = [[nameUser.trim(), emailUser.trim(), passEncrypt, rolUser, encryptKeyUser || null]];

      con.query(sql, [values], function (err, result) {
        if (err) {
          console.error('DB insert error:', err);
          return res.status(500).json({ error: 'database insert error' });
        }
        return res.json(result);
      });
    });
});

app.put('/users/:id', (req, res) => {

  console.log("update user!");

    const { id } = req.params;
    const { nameUser, emailUser, passUser, rolUser, encryptKeyUser} = req.body;

    console.log(id + " - " + nameUser + " - " + emailUser + " - " + passUser);

    passEncrypt = encrypt(req.body.passUser);

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
      UPDATE users 
      SET nameUser = "${nameUser}", 
      emailUser = "${emailUser}",
      passUser = "${passEncrypt}",
      rolUser = "${rolUser}",
      encryptKeyUser = "${encryptKeyUser}" 
      WHERE id = "${id}"
    `;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record modified");
      console.log(result);

      res.json(result);
    });
    
  });
    
});

app.delete('/users/:id', (req, res) => {
    console.log("delete user!");

    let con;
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

    let sql = "DELETE FROM users WHERE id = ?";

    let values = [
      [id]
    ]

    con.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log("1 record deleted");
      console.log(result);

      res.json(result);
    });
    
  });
});


app.get('/login', (req, res) => {
  const userEmail = req.query.email;
  const userPass = req.query.pass;

  if (!userEmail || !/^\S+@\S+\.\S+$/.test(userEmail) || !userPass) {
    return res.status(400).json({ error: 'email y contra son requeridos' });
  }

  console.log("email: " + userEmail + " userPass: " + userPass);

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
    con.query(sql, [userEmail.trim()], function (err, result) {
        if (err) {
          console.error('DB query error:', err);
          return res.status(500).json({ error: 'database query error' });
        }

        const rows = Object.values(JSON.parse(JSON.stringify(result)));
        if (!rows || rows.length === 0){ 
          return res.json({ user: 'FALSE' });
        }

        if(rows.length > 0){
          console.log(rows);
          resultFinal = rows[0];
          console.log(resultFinal);
          passUserDecrypt = decrypt(resultFinal.passUser);

          if(!passUserDecrypt || passUserDecrypt != userPass){
            return res.json({ user: 'FALSE' });
          }else{
            rows[0] = resultFinal;
          }
        }

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
        res.json(result);
        
    });
    
  });


});

function userExistsByEmail(email){
  console.log("checking if user exists!");

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

        if(resultRows.length == 0){
          console.log("user does not exists!");
          return false;
        }else{
          console.log("user does exists!");
          return true;
        }
        
    });
    
  });
}



//--------------------------Jimp compatibility--------------------------------------

// Resize y compresion de imagenes antes de guardar, intento mantener el aspect ratio,
// pero limito la imagen a 1024 (si es mas pequeña, no lo modifico) y la guardo en png
async function resizeAndWriteImage(buffer, outPath){
  // Asegurar Jimp
  if (!Jimp || typeof Jimp.read !== 'function') {
    try {
      const mod = await import('jimp');
      Jimp = mod.Jimp || mod.default || mod;
    } catch (e) {}
  }

  if (!Jimp || typeof Jimp.read !== 'function') {
    throw new Error('Jimp.read is not available. Ensure the "jimp" package is installed and compatible.');
  }
  console.log('resizeAndWriteImage: start, outPath ->', outPath);

  let image;
  try {
    const readPromise = Jimp.read(buffer);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Jimp.read timeout after 15s')), 15000));
    image = await Promise.race([readPromise, timeout]);
  } catch (err) {
    console.error('resizeAndWriteImage: Jimp.read failed:', err && err.stack ? err.stack : err);
    throw err;
  }

  console.log('resizeAndWriteImage: image loaded', !!image && !!image.bitmap, 'size:', image && image.bitmap ? `${image.bitmap.width}x${image.bitmap.height}` : 'unknown');

  const MAX_WIDTH = 1024;
  try {
    if (image.bitmap && image.bitmap.width && image.bitmap.width > MAX_WIDTH) {
      await image.resize(MAX_WIDTH, Jimp.AUTO);
    }
  } catch (e) {
    console.warn('resizeAndWriteImage: resize failed', e && e.stack ? e.stack : e);
  }

  try {
    if (typeof image.deflateLevel === 'function') {
      image.deflateLevel(9);
    }
  } catch (e) {}

  try {
    if (typeof image.writeAsync === 'function') {
      await image.writeAsync(outPath);
    } else {
      // fallback using getBufferAsync
      if (typeof image.getBufferAsync === 'function') {
        const mime = Jimp.MIME_PNG || 'image/png';
        const buf = await image.getBufferAsync(mime);
        await fs.promises.writeFile(outPath, buf);
      } else {
        // last resort: try synchronous write (may not exist)
        try {
          image.write(outPath);
        } catch (err) {
          throw new Error('No suitable write method available on Jimp image');
        }
      }
    }
  } catch (err) {
    console.error('resizeAndWriteImage: write failed', err && err.stack ? err.stack : err);
    throw err;
  }
}


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
              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
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
              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
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
              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
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
              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
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

  const initialTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const initialTimestampNameAux = initialTimestamp.replace(" ","_").replaceAll(":","-");
  const initialTimestampName = initialTimestampNameAux.replaceAll("-","_");

  const archivoNombre = CARPETAPDF + "/" + userId + "/" + nombreFile + "_" + initialTimestampName + '.pdf';
  console.log(archivoNombre);

  if(!pdfFile){
    return res.status(400).json({ error: 'No uploadedFile provided' });
  }

  try{
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

        res.json(result);
      });
      
    });

  }catch(err){
    console.error('create-pdf error:', err);
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

  if (fs.existsSync(pathDelete)) {
    // delete the file on server after it sends to client
    const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
    unlinkFile(pathDelete);
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

  const estado = req.body.estado || 'PENDING';

  const userIdNuevo = req.body.userIdNuevo;
  const userIdOriginal = req.body.userIdOriginal;

  const archivoNombreNuevo = CARPETAPDF + "/" + userIdNuevo + "/" + nombreFileNuevo + "_" + initialTimestampName + '.pdf';
  const archivoNombreOriginal = CARPETAPDF + "/" + userIdOriginal + "/" + nombreFileOriginal + "_" + initialTimestampName + '.pdf';
  
  var pdfFile = (req.files && req.files.uploadedFile) ? req.files.uploadedFile : null;

  console.log(id, archivoNombreNuevo, archivoNombreOriginal, nombreFileOriginal, nombreFileNuevo, estado, userIdOriginal, userIdNuevo, !!pdfFile);

  try{
    if(pdfFile === null){
      // rename file
      if (fs.existsSync(archivoNombreOriginal)){
        fs.renameSync(archivoNombreOriginal, archivoNombreNuevo);
        console.log('The file has been re-named to: ' + archivoNombreNuevo);
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

      fs.writeFileSync(archivoNombreNuevo, pdfFile.data);
      console.log('File written successfully:', archivoNombreNuevo);
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
      const uploadTs = metadata.uploadTimestamp.toISOString().slice(0, 19).replace('T', ' ');

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
          return res.status(500).json({ error: 'database update error' });
        }
        console.log("1 record modified");
        console.log(result);

        res.json(result);
      });

    })
  }catch(err){
    console.error('modify-pdf error:', err);
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
          var queryBusqueda = "SELECT pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, nameUser, estado, DATE_ADD(initialUploadTimestamp, INTERVAL 1 HOUR) as initialUploadTimestamp, userId, stampUserId, DATE_ADD(stampTimestamp, INTERVAL 1 HOUR) as stampTimestamp FROM pdfs INNER JOIN users ON pdfs.stampUserId = users.id WHERE pdfs.id = ?"

          let values = [
            [id]
          ]

          connection.query(queryBusqueda,[values], function (err, result, fields) {
              if (err) throw err;
              
              //console.log(result);

              resultRows = Object.values(JSON.parse(JSON.stringify(result)));

              //console.log(resultRows);
              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
  }

});

app.put('/stamp/:id', async (req, res) => {

  console.log("llegado al stamp");
  console.log(req.body);

  const { id } = req.params;
  const { filename, stampUserId, originalUserId, initialTimestampName} = req.body;
  const archivoPdf = CARPETAPDF + "/" + originalUserId + "/" + filename + "_" + initialTimestampName + '.pdf';
  const archivoStampPNG = CARPETASTAMP + "/" + stampUserId + '.png';
  const archivoStampJPG = CARPETASTAMP + "/" + stampUserId + '.jpg';
  const archivoStampJPEG = CARPETASTAMP + "/" + stampUserId + '.jpeg';
  var stampTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (fs.existsSync(archivoPdf) && (fs.existsSync(archivoStampPNG) || fs.existsSync(archivoStampJPG) || fs.existsSync(archivoStampJPEG))){

    console.log(id, archivoPdf, stampUserId, archivoStampPNG, archivoStampJPG, archivoStampJPEG);

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
      });
      })
    }catch(err){
      console.error('stamp-pdf error:', err);
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
            x: page.getWidth() / 2 - dims.width / 2 + 75,
            y: page.getHeight() / 2 - dims.height + 250,
            width: dims.width,
            height: dims.height,
        })

        //console.log("insertando timestamp al pdf " + stampTimestamp.toString());
        page.drawText(stampTimestamp.toString(), {
            x: 5,
            y: page.getHeight() / 2 + 300,
            size: 50,
            font: helveticaFont,
            color: rgb(0.95, 0.1, 0.1),
            rotate: degrees(-45),
            opacity: 0.3,
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    //const newFilePath = CARPETAPDF + "/" + filename + '-estampado.pdf';
    const newFilePath = CARPETAPDF + "/" + originalUserId + "/" + filename + "_" + initialTimestampName + "-stamp" + '.pdf';
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
    console.warn('Pdf o Estampado no se han encontrado');
    return res.status(500).json({ error: 'failed to find pdf or stamp' });

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
          return res.status(500).json({ error: 'database update error' });
        }
        console.log("1 record modified");
        console.log(result);

        res.json(result);
      });

    })
  }catch(err){
    console.error('modify-pdf stamp error:', err);
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
              res.json(resultRows);
          });
      });

  } catch (error) {
      console.log("Error al conectar con la base de datos");
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

  if (fs.existsSync(archivoPdf) && pdfFile !== null){

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

      const signTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

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
      });
      })
    }catch(err){
      console.error('sign-pdf error:', err);
      return res.status(500).json({ error: 'failed to sign pdf' });
    }

    //-------------------------------------------------------------------

    const newFilePath = CARPETAPDF + "/" + originalUserId + "/" + fileName + "_" + initialTimestampName + "-sign" + '.pdf';
    fs.writeFileSync(newFilePath, pdfFile);

    console.log("Leyendo pdf: " + newFilePath);

    const rs = fs.createReadStream(newFilePath);

    // get size of the file
    const { size } = fs.statSync(newFilePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", size);

    console.log("Enviando pdf: " + newFilePath);

    rs.pipe(res);

  }else{
    console.warn('Pdf no se ha encontrado');
    return res.status(500).json({ error: 'failed to find pdf' });

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
          return res.status(500).json({ error: 'database update error' });
        }
        console.log("1 record modified");
        console.log(result);

        res.json(result);
      });

    })
  }catch(err){
    console.error('modify-pdf sign error:', err);
    return res.status(500).json({ error: 'failed to modify sign pdf' });
  }

})  



//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------
//----------------------------------------------------------------



app.post('/create-stamp', fileUpload(), async (req, res) => {
  const stampFile = req.files && req.files.uploadedFile ? req.files.uploadedFile : null;
  const nombreFile = req.body.userId;

  if (!stampFile) {
    return res.status(400).json({ error: 'No uploadedFile provided' });
  }

  const mime = (stampFile.mimetype || '').toLowerCase();
  if (!['image/png', 'image/jpeg', 'image/jpg'].includes(mime)) {
    return res.status(400).json({ error: 'uploaded file must be PNG, JPEG or JPG' });
  }

  const stampDir = path.join(process.cwd(), CARPETASTAMP);
  if (!fs.existsSync(stampDir)) fs.mkdirSync(stampDir, { recursive: true });

  const outPath = path.join(stampDir, nombreFile + '.png');
  if (fs.existsSync(outPath) || fs.existsSync(path.join(stampDir, nombreFile + '.jpg')) || fs.existsSync(path.join(stampDir, nombreFile + '.jpeg'))) {
    return res.status(400).json({ error: 'File already exists' });
  }

  try {
    await resizeAndWriteImage(stampFile.data, outPath);
    await modifyImage(outPath);
    return res.json({ saved: true, path: outPath });
  } catch (err) {
    console.error('create-stamp error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'image processing failed' });
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
  // ensure Jimp is available
  if (!Jimp || typeof Jimp.read !== 'function') {
    try {
      const mod = await import('jimp');
      Jimp = mod.Jimp || mod.default || mod;
    } catch (e) {}
  }

  if (!Jimp || typeof Jimp.read !== 'function') {
    const err = new Error('Jimp.read is not available. Ensure the "jimp" package is installed and compatible.');
    console.error('modifyImage:', err.message);
    throw err;
  }

  let image;
  try {
    const buffer = fs.readFileSync(imageName);
    const readPromise = Jimp.read(buffer);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Jimp.read timeout after 15s')), 15000));
    image = await Promise.race([readPromise, timeout]);
  } catch (err) {
    console.error('modifyImage: Jimp.read failed:', err && err.stack ? err.stack : err);
    throw err;
  }

  try {
    if (typeof image.opacity === 'function') {
      image.opacity(0.3);
    } else if (typeof image.fade === 'function') {
      image.fade(0.7);
    }
  } catch (e) {}

  try {
    if (typeof image.deflateLevel === 'function') {
      image.deflateLevel(9);
    }
  } catch (e) {}

  try {
    if (typeof image.writeAsync === 'function') {
      await image.writeAsync(imageName);
    } else {
      if (typeof image.getBufferAsync === 'function') {
        const mime = Jimp.MIME_PNG || 'image/png';
        const buf = await image.getBufferAsync(mime);
        await fs.promises.writeFile(imageName, buf);
      } else {
        try {
          image.write(imageName);
        } catch (err) {
          throw new Error('No suitable write method available on Jimp image');
        }
      }
    }
  } catch (err) {
    console.error('modifyImage: write failed', err && err.stack ? err.stack : err);
    throw err;
  }
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

//-----------------------
app.listen(APIPORT, () => {
  console.log(`Firma app listening at http://localhost:${APIPORT}`);
});

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

//---------------------
//--------------------

/*async function modifyImageTransparent(imageName){
  console.log("Iniciado modificacion transparent de stamp");

  // open a file called "lenna.png"
  gm(imageName)

 // Invoke transparent function on white color
  .transparent('white')

  // Process and Write the image
  .write(imageName, function (err) {
      if (!err) console.log('done');
  });

  console.log("Finalizado modificacion transparent de stamp");
}*/

/*app.put('/stamp/:id', async (req, res) => {

  console.log("llegado al stamp");
  console.log(req.body);

  const { id } = req.params;
  const { filename, stampUserId} = req.body;
  const archivoPdf = CARPETAPDF + "/" + filename + '.pdf';
  const archivoStamp = CARPETASTAMP + "/" + stampUserId + '.png';

  if (fs.existsSync(archivoPdf) && fs.existsSync(archivoStamp)){

    console.log(id, archivoPdf, stampUserId, archivoStamp);

    const pdfDoc = await PDFDocument.load(fs.readFileSync(archivoPdf));
    const img = await pdfDoc.embedPng(fs.readFileSync(archivoStamp));
    //await pdfDoc.embedJpg
    const imagePage = pdfDoc.insertPage(0);

    imagePage.drawImage(img, {
      x: 0,
      y: 0,
      width: imagePage.getWidth(),
      height: imagePage.getHeight()
    });

    const pdfBytes = await pdfDoc.save();
    //const newFilePath = CARPETAPDF + "/" + filename + '-estampado.pdf';
    const newFilePath = CARPETAPDF + "/" + filename + '.pdf';
    fs.writeFileSync(newFilePath, pdfBytes);

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

      const stampTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

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
      });
      })
    }catch(err){
      console.error('modify-pdf error:', err);
      return res.status(500).json({ error: 'failed to modify pdf' });
    }

    //--------------------------------------------------
    console.log("Leyendo pdf: " + newFilePath);

    const rs = fs.createReadStream(newFilePath);

    // get size of the file
    const { size } = fs.statSync(newFilePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", size);

    console.log("Enviando pdf: " + newFilePath);

    rs.pipe(res);

  }else{
    console.warn('Pdf o Estampado no se han encontrado');
    return res.status(500).json({ error: 'failed to find pdf or stamp' });

  }
  
})*/

/*app.put('/modify-pdf/:id', fileUpload(), (req, res) => {

  console.log("llegado al modify-pdf");
  
  console.log(req.files);

  const { id } = req.params;

  const nombreFileNuevo = req.body.filename;
  const nombreFileOriginal = req.body.filenameOriginal;
  const estado = req.body.estado;
  const userId = req.body.userId;

  const archivoNombreNuevo = CARPETAPDF + "/" + nombreFileNuevo + '.pdf';
  const archivoNombreOriginal = CARPETAPDF + "/" + nombreFileOriginal + '.pdf';
  
  var pdfFile;
  if(req.files != null){
    pdfFile = req.files.uploadedFile;
  }else{
    pdfFile = null;
  }

  console.log(id);
  console.log(archivoNombreNuevo);
  console.log(archivoNombreOriginal);
  console.log(nombreFileOriginal);
  console.log(nombreFileNuevo);
  console.log(estado);
  console.log(userId);
  console.log(pdfFile);

  if(pdfFile === null){

    fs.rename(archivoNombreOriginal, archivoNombreNuevo, function (err) {
      if (err) {console.log(err); return; }
      
        console.log('The file has been re-named to: ' + archivoNombreNuevo);
      })

  }
  
  if(pdfFile !== null && pdfFile.data !== null){

    if (fs.existsSync(archivoNombreOriginal)) {
      // delete the file on server after it sends to client
      const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
      unlinkFile(archivoNombreOriginal);
    }

    fs.writeFileSync(archivoNombreNuevo, pdfFile.data, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written successfully');
        }
    });

  }


  //-----------------------------------

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
      SET userId = "${userId}", 
      name = "${nombreFileNuevo}",
      urlCarpeta = "${archivoNombreNuevo}",
      estado = "${estado}"
      WHERE id = "${id}"
    `;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("1 record modified");
      console.log(result);

      res.json(result);
    });

  })
})*/

//------------------------
//-----------------------

/*app.post('/users/login', (req, res) => {
  console.log("get user login!");

  let con;
  var resultRows;

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
      SELECT * FROM users WHERE 
      emailUser = "${req.body.emailUser}" 
      AND passUser = "${req.body.passUser}"
    `;

    console.log(sql);

    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        
        console.log(result);

        resultRows = Object.values(JSON.parse(JSON.stringify(result)));
        console.log(resultRows);

        if(resultRows.length == 0){
          console.log("user does not exists!");
          res.json({user: "FALSE"});
        }

        if(resultRows.length > 0 && resultRows[0].rolUser == "ADMIN"){
          console.log("user exists and is ADMIN!");
          res.json({user: resultRows});
        }

        if(resultRows.length > 0 && resultRows[0].rolUser == "CLIENT"){
          console.log("user exists and is CLIENT!");
          res.json({user: resultRows});
        }

        if(resultRows.length > 0 && resultRows[0].rolUser == "FIRMA"){
          console.log("user exists and is FIRMA!");
          res.json({user: resultRows});
        }
        
    });
    
  });
});*/

/*app.delete('/eliminate', function(req, res) {

  console.log("llegado al delete pdf puro");
  const pathAxios = CARPETAPDF + "/" + 'output.pdf';
  // delete the file on server after it sends to client
  const unlinkFile = util.promisify(fs.unlink); // to del file from local storage
  unlinkFile(pathAxios);

})*/

/*app.get('/retrieve', function(req, res) { 
  const pathAxios = CARPETAPDF + "/" + 'output.pdf'; // path where to file is stored in server

  console.log("llegado al retrieve puro");
  const rs = fs.createReadStream(pathAxios);

  // get size of the video file
  const { size } = fs.statSync(pathAxios);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Length", size);
  rs.pipe(res);
  
})*/

/*app.post('/create-pdf', (req, res) => {

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
    console.log("Connected to pdf!");
    console.log(req.body);

    let sql = "INSERT INTO pdfs (userId, name, urlCarpeta) VALUES ?";

    var urlCarpeta = CARPETAPDF + "/" + req.body.name + ".pdf";
    var datosPDF = req.body.docDatos;

    console.log(urlCarpeta);
    //console.log(datosPDF);

    //if(datosPDF){
    //  console.log(datosPDF);
    //  console.log("procesando");
    //  var base64Data = datosPDF.replace("data:application/pdf;base64,", "");
    //  //require("fs").writeFile(urlCarpeta, base64Data, 'base64',
    //  require("fs").writeFileSync(urlCarpeta, base64Data, 'base64', function(err) {
    /7    console.log("error");
    //    console.log(err);
    //  });
    //}

    let values = [
      [req.body.userId, req.body.name, urlCarpeta]
    ]

    con.query(sql, [values], function (err, result) {
      if (err) throw err;
      console.log("1 record inserted into pdf");
      console.log(result);

      res.json(result);
    });
    
  });
});*/

/*app.post('/upload', fileUpload(), function(req, res) { 
  console.log("llegado al upload puro"); 
  const sampleFile = req.files.uploadedFile;
  const nombreFile = req.body.filename;
  const archivoNombrePrueba = CARPETAPDF + "/" + 'output.pdf';

  //console.log(req);
  console.log(sampleFile);
  console.log(nombreFile);

  fs.writeFileSync(archivoNombrePrueba, sampleFile.data, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written successfully');
        }
  });

  res.send('File uploaded puro');
})*/

/*

let formData = {
        files: {
            value: fs.createReadStream(filePath),
            options: {
                filename: 'test.docx'
            }
        }
      };

*/

/*

const FormData = require('form-data'); 
const form = new FormData();
form.append('file', fs.createReadStream(filepath), {filename: 'newname'});

*/
//-----------------------
//-----------------------


//---------------


/*

app.post('/upload', fileUpload(), function(req, res) { 
  console.log("llegado al upload"); 
  const sampleFile = req.files.uploadedFile;
  const nombreFile = req.body.filename;
  const archivoNombrePrueba = CARPETAPDF + "/" + 'output.pdf';
  console.log(nombreFile);

  fs.writeFileSync(archivoNombrePrueba, sampleFile.data, (err) => {
        if (err) {
            console.error('Error writing file:', err);
        } else {
            console.log('File written successfully');
        }
  });

  res.send({'File uploaded'});
})


*/


/*

app.get('/retrieve', function(req, res) { 
  console.log("llegado al retrieve");
  
  const archivoNombrePruebaRetrieve = CARPETAPDF + "/" + 'output.pdf'; 
  var formData = new FormData();
  var fileData;

  if (fs.existsSync(archivoNombrePruebaRetrieve)) {

    //'ascii', 'base64', 'binary', 'utf8'
    //const fileData = fs.readFileSync(filePath);
    //const buffer = Buffer.from(fileData, "binary");
    fs.readFileSync(archivoNombrePruebaRetrieve, (err, data) => {
      console.log("leyendo archivo");

      if (err) {
        console.error('Error reading file:', err);
        return;
      }

      console.log('File contents:', data.toString());

    });

    const stringData = new FormData();
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    fs.readFileSync(archivoNombrePruebaRetrieve, (error, data) => {  
      if (error) console.log(error)  
      if (data) {    
        // append key-value pair of a file name and the file
        // note that file should be File or Blob object
        stringData.append('strings-file', data) 
      }
      console.log('data type =', typeof stringData, '\n', stringData)
    })
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");

    fileData = fs.readFileSync(archivoNombrePruebaRetrieve);
    //const buffer = Buffer.from(fileData, "binary");
    //console.log(buffer);
  }

  console.log(fileData);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="output.pdf"');
  return res.status(200).send(fileData);


  //res.type('application/pdf');
  //res.type('application/json');
  //res.header('Content-Disposition', 'attachment; filename="output.pdf"');
  //res.send(Buffer.from(fileData, 'base64'));

  formData.append("docName", 'output.pdf');
  formData.append("uploadedFile", fileData);
  //var jsonFormData = JSON.stringify(formData);
  console.log(formData);
  res.json(formData);
      
  // Stream res directly
  //fileData.body.pipe(res);


  //console.log("finalizado retrieve");
  //console.log(formData);
  //var jsonFormData = JSON.stringify(formData);
  //console.log(jsonFormData);
  //res.json(jsonFormData);

  //request.end();


  //const file_blob = new Blob([fileData], { type: "binary" })
  //formData.append('file', file_blob, 'output.pdf')

  //var form = new formdata();
  //form.append('docName', 'output.pdf');
  //form.append('docData', fileData);
})

*/

/*app.get('/download', function (req, res) {
  var options = {
    method: 'GET',
    host: 'localhost',
    port: port,
    path: '/file'
  };

  var request = http.request(options, function(response) {
    var data = [];

    response.on('data', function(chunk) {
      data.push(chunk);
    });

    response.on('end', function() {
      data = Buffer.concat(data);
      console.log('requested content length: ', response.headers['content-length']);
      console.log('parsed content length: ', data.length);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=working-test.pdf',
        'Content-Length': data.length
      });
      res.end(data);
    });
  });

  request.end();
});*/


/*app.post('/upload', upload.single('file'), async (req, res) => {
    var filePath = CARPETAPDF + "/" + "document" + ".pdf";
    var filePrueba = req.file;
    console.log(filePrueba);

    try {
        // Check if a file was uploaded
        if (!filePrueba) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log(filePrueba);

        // Retrieve the uploaded file from the request body
        const uploadedFile = filePrueba;

        // Write the file to the upload directory
        var filePath = CARPETAPDF + "/" + "document" + ".pdf";
        const fileData = fs.readFileSync(filePath, 'utf8');
        await processFileData(fileData);

        // Determine the file type
        const fileExtension = uploadedFile.mimetype ?uploadedFile.mimetype : null;

        // Check if the file is already in PDF format
        if (fileExtension === 'application/pdf') {
            // Process the PDF directly
            await processPDF(filePath, res);
        } else {
            // Convert the file to PDF
            const convertedFilePath = await convertToPDF(filePath);

            // Process the converted PDF
            await processPDF(convertedFilePath, res);
        }
    } catch (error) {
         console.error('An error occurred while processing the file:', error);
         res.status(500).json({ error: 'Failed to process the file' });
    }
});

// Function to process the PDF and count word occurrences
async function processPDF(pdfFilePath, res) {
    try {
        // Parse the PDF content
        const pdfBuffer = fs.readFileSync(pdfFilePath);
        const data = await PDFParser(pdfBuffer);
        const pdfText = data.text;

        // Define the words to search and their initial count
        const technologies = ['Node.js', 'React.js', 'Angular', 'Vue.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Sass', 'Bootstrap', 'jQuery', 'Python', 'Java', 'Ruby', 'Go', 'PHP', 'Swift', 'Kotlin', 'Rust', 'SQL', 'MongoDB', 'Firebase', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'GitHub', 'Jenkins', 'CI/CD', 'REST API', 'GraphQL', 'OAuth', 'JSON', 'XML', 'Microservices', 'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Big Data', 'Blockchain'];
        let wordCounts = {};

        // Count the occurrences of each search word
         technologies.forEach((word) => {
            const regex = new RegExp(word, 'gi');
            const count = (pdfText.match(regex) || []).length;
            wordCounts[word] = count;
        });

        // Return the word counts as the response
         wordCounts = Object.fromEntries(Object.entries(wordCounts).filter(([key, value]) => value !== 0));
         res.json({ wordCounts });
    } catch (error) {
          console.error('An error occurred while processing the PDF:', error);
          res.status(500).json({ error: 'Failed to process the PDF' });
    } finally {
        // Clean up - delete the uploaded file and PDF file if needed
    }
}

// Helper function to convert files to PDF using external converter
async function convertToPDF(filePath) {
  return new Promise((resolve, reject) => {
      const convertedFilePath = path.join('converted/', `nuevo_documento.pdf`);

      mammoth.extractRawText({ path: filePath })
      .then((result) => {
          console.log(result);
        })
      .catch((error) => {
          reject(error);
        });
    });

  }*/
//-----------------------
//-----------------------
//-----------------------



//------------------------------------------------------
//------------------------------------------------------
//-----------------------------------------------------
//------------------------------------------------------

/*app.get('/add-movie', (req, res) => {
    
    .then((result) => {
        res.send(result)
    })
    .catch((err) =>{
        console.log(err)
    });
})

app.get('/all-movies', (req, res) => {

    .then((result) => {
        res.send(result)
    })
    .catch((err) =>{
        console.log(err)
    });
})

app.get('/one-movie', (req, res) => {
    
    .then((result) => {
        res.send(result)
    })
    .catch((err) =>{
        console.log(err)
    });
})*/

//---------------------------------------------------
//----------------------------------------------------
//----------------------------------------------------


