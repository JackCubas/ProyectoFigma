(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
(function (window) {
  'use strict'
  var VERSION = '0.0.5'
  var APPURL = 'wss://app.web-eid.com:42123'

  // make a nonce
  function getNonce (l) {
    if (l === undefined) {
      l = 24
    }
    var val = ''
    var hex = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVXYZ'
    for (var i = 0; i < l; i++) val += hex.charAt(Math.floor(Math.random() * hex.length))
    return val
  }

  function ab2b (v) {
    return window.btoa(String.fromCharCode.apply(null, new Uint8Array(v)))
  }

  function b2ab (v) {
    return new Uint8Array(window.atob(v).split('').map(function (c) { return c.charCodeAt(0) })).buffer
  }

  var pending = {} // pending promises
  var port = null

  // Resolve or reject the promise if id matches
  function processMessage (reply) {
    // reply.hwcrypto is in window message listener.
    if (!reply.hwcrypto && reply.id && reply.id in pending) {
      console.log('RECV: ' + JSON.stringify(reply))
      if (!reply.error) {
        pending[reply.id].resolve(reply)
      } else {
        pending[reply.id].reject(new Error(reply.error))
      }
      delete pending[reply.id]
    }
  }

  function toExtension (msg) {
    return new Promise(function (resolve, reject) {
      msg.id = getNonce()
      msg.hwcrypto = true // This will be removed by content script
      window.postMessage(msg, '*')
      pending[msg.id] = {
        resolve: resolve,
        reject: reject
      }
    })
  }

  // Send a message and return the promise.
  function msg2promise (msg) {
    return new Promise(function (resolve, reject) {
      // amend with necessary metadata
      msg.id = msg.id || getNonce()
      console.log('SEND: ' + JSON.stringify(msg))
      // send message
      if (!port) { reject(new Error('App has disappeared')) }
      port.send(msg)
      // and store promise callbacks
      pending[msg['id']] = {
        resolve: resolve,
        reject: reject
      }
    })
  }

  // construct
  var webeid = function () {
    console.log('Web eID JS shim v' + VERSION)

    // register incoming message handler for extension
    window.addEventListener('message', function (message) { processMessage(message.data) })

    // Fields to be exported
    var fields = {}

    // Returns app version
    fields.getVersion = function () {
      return msg2promise({
        'version': {}
      }).then(function (r) {
        return r.version
      })
    }

    fields.isAvailable = function (options) {
      // Already open
      if (port) {
        return Promise.resolve(port.technology)
      }

      // If the extension is not responding, the only
      // way to get a connection without reloading the page
      // is if the application is download and started
      // thus only websockets must be re-tried
      var timeout = 0
      if (options) { timeout = options.timeout || timeout }
      if (typeof timeout === 'number') { timeout = timeout * 1000 }
      if (timeout === 0) { timeout = 700 }
      if (timeout === Infinity) { timeout = 10 * 60 * 1000 } // 10 minutes
      console.log('Actual timeout is', timeout / 1000, 'seconds')
      var retry = true

      // Try to open the websocket and increase the timeout if it fails
      // and our timeout is Infinity
      // This will only successfully resolve
      function openSocket () {
        var delay = 1000 // delay before trying to re-connect socket
        return new Promise(function (resolve, reject) {
          function connect () {
            if (!retry) { return reject(new Error('Already connected')) }
            delay = delay * 1.3
            try {
              var ws = {}
              ws.socket = new WebSocket(APPURL)
              ws.technology = 'websocket'

              ws.socket.addEventListener('open', function (event) {
                console.log('WS open', event)
                // clearTimeout(retry)
                ws.socket.addEventListener('message', function (m) {
                  processMessage(JSON.parse(m.data))
                })
                ws.send = function (msg) {
                  ws.socket.send(JSON.stringify(msg))
                }
                ws.socket.addEventListener('close', function (event) {
                  console.error('WS close: ', event)
                  if (port.technology === 'websocket') { port = null }
                })
                resolve(ws)
              })
              ws.socket.addEventListener('error', function (event) {
                console.error('WS error: ', event)
                if (retry) {
                  setTimeout(function () {
                    console.log('Will retry in', delay / 1000, 'seconds')
                    connect()
                  }, delay)
                }
              })
            } catch (e) {
              console.log('Could not create WS', e)
              reject(e)
            }
          }
          // give extension head start
          setTimeout(connect, 700)
        })
      }

      // Race for a port
      // Resolves if extension replies. Will never happen if no extension
      var e = toExtension({version: {}}).then(function (response) {
        return {
          send: function (message) {
            message.hwcrypto = true
            window.postMessage(message, '*')
          },
          technology: 'webextension'
        }
      })

      // Rejects after timeout
      var t = new Promise(function (resolve, reject) {
        setTimeout(function () {
          reject(new Error('timeout'))
        }, timeout)
      })

      // resolves to websocket lookalike with .send() if open is successful
      var s = openSocket()

      // Race to connection
      return Promise.race([e, s, t]).then(function (r) {
        retry = false
        console.log('race resolved to', r.technology)
        port = r
        return r.technology
      }).catch(function (err) {
        retry = false
        console.log('race failed', err)
        return false
      })
    }

    fields.getCertificate = function (options) {
      options = options || {}
      // resolves to a certificate handle (in real life b64)
      return msg2promise({ 'certificate': options }).then(function (r) {
        return b2ab(r.certificate)
      })
    }

    fields.sign = function (cert, hash, options) {
      return msg2promise({
        'sign': {
          'certificate': ab2b(cert),
          'hash': ab2b(hash),
          'hashalgo': options.hashalgo
        }
      }).then(function (r) {
        return b2ab(r.signature)
      })
    }

    // TODO: return an object where onLogout resolves if cert removed
    function authenticate (nonce) {
      return msg2promise({
        'authenticate': { 'nonce': nonce }
      }).then(function (r) {
        return r.token
      })
    }
    fields.authenticate = authenticate

    // Connect to a card reader in plain PC/SC mode
    fields.connect = function (options) {
      if (options === 'undefined') { options = {} }

      var timeout = options.timeout || Infinity
      // Infinity is actually 1 hour
      if (timeout === Infinity) { timeout = 3600 }

      var atrs = options.atrs || []
      atrs = atrs.map(function (x) { return ab2b(x) })

      var protocol = options.protocol || '*'

      return msg2promise({
        SCardConnect: {protocol: protocol, atrs: atrs}
      }).then(function (r) {
        return {
          name: r.name,
          atr: b2ab(r.atr),
          protocol: r.protocol,

          transmit: function (bytes) {
            return msg2promise({
              SCardTransmit: {reader: r.name, bytes: ab2b(bytes)}
            }).then(function (r) {
              return b2ab(r.bytes)
            })
          },
          reconnect: function (protocol) {
            return msg2promise({
              SCardReconnect: {reader: r.name, protocol: protocol}
            }).then(function (r) {
              return true
            })
          },
          disconnect: function () {
            return msg2promise({
              SCardDisconnect: {reader: r.name}
            }).then(function (r) {
              return true
            })
          },
          control: function (code, bytes) {
            return msg2promise({
              SCardControl: {reader: r.name, code: code, bytes: ab2b(bytes)}
            }).then(function (r) {
              return b2ab(r.bytes)
            })
          }
        }
      })
    }

    fields.authenticatedWebSocket = function (url, options) {
      return new Promise(function (resolve, reject) {
        var socket = new WebSocket(url)
        function errorHandler (event) {
          reject(event)
        }

        function messageHandler (event) {
          socket.removeEventListener('message', messageHandler)
          var msg = JSON.parse(event.data)
          if (!msg.nonce) {
            reject(new Error('No .nonce in first message'))
          }
          authenticate(msg.nonce).then(function (token) {
            socket.send(JSON.stringify({token: token}))
            socket.removeEventListener('error', errorHandler)
            resolve(socket)
          }, function (reason) {
            socket.close()
            reject(reason)
          })
        }
        function openHandler (event) {
          socket.addEventListener('message', messageHandler)
        }
        socket.addEventListener('error', errorHandler)
        socket.addEventListener('open', openHandler)
      })
    }

    fields.VERSION = VERSION
    fields.promisify = msg2promise

    return fields
  }

  // Register
  if (typeof exports !== 'undefined') {
    // nodejs
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = webeid()
    } else {
      exports.webeid = webeid()
    }
  } else {
    // requirejs
    if (typeof define === 'function' && define.amd) {
      define(function () {
        return webeid()
      })
    } else {
      // browser
      window.webeid = webeid()
    }
  }
})(typeof window === 'object' ? window : this)

},{}],2:[function(require,module,exports){
//import * as webeid from '@web-eid/web-eid-library/web-eid.js';

//import * as webeid from '../node_modules/@web-eid/web-eid-library/web-eid';
//import * as webeid from '@web-eid/web-eid-library';
//import * as webeid from 'web-eid.js';

webeid = require('web-eid');

const lang = navigator.language.substr(0, 2);
const authButton = document.querySelector("#webeid-auth-button");

authButton.addEventListener("click", async () => {
    try {

      //webeid.authenticate(string nonce, object options);
      var ranNum = Math.random();
      let autent = webeid.authenticate(ranNum.toString());

      let res = autent.then(function(result) {
        console.log(result);

        /*result.then(function(result_2){
            console.log(result_2);
        })*/

      })
      .then(function(result_2){
          console.log(result_2);
      })
      .catch(console.error)

      /*res.then(function(result_2){
          console.log(result_2);
      })
      .catch(console.error)*/

        
    } catch (error) {
        console.log("Authentication failed! Error:", error);
        throw error;
    }
});

const signButton = document.querySelector("#webeid-sign-button");

signButton.addEventListener("click", async () => {
    try {

      let hash   = CryptoJS.SHA256('hello world');
      let buffer = new ArrayBuffer(hash.toString(CryptoJS.enc.Hex), 'hex');
      let array  = new Uint8Array(buffer);
      //Array.from(array);

      //webeid.sign(ArrayBuffer certificate, ArrayBuffer hash, object options)
      let sign = webeid.sign(webeid.getCertificate(), buffer, "SHA256")

      sign.then(function(result) {
        console.log(result);
      })
      .catch(console.error)
      
        
    } catch (error) {
        console.log("Signing failed! Error:", error);
        throw error;
    }
});


const certButton = document.querySelector("#webeid-cert-button");

certButton.addEventListener("click", async () => {
    try {

      //webeid.getCertificate(object options);

      let cert = webeid.getCertificate()

      cert.then(function(result) {
        console.log(result);
      })
      .catch(console.error)
        
    } catch (error) {
        console.log("Certificate failed! Error:", error);
        throw error;
    }
});
},{"web-eid":1}]},{},[2]);

//-------------------------------------------

const URLSERVERFirmadoDigital = "http://localhost:3000/firmadoDigital/";
const URLSERVERdetail = "http://localhost:3000/pdfs/";

const URLSERVERretrieve = "http://localhost:3000/retrieve/";

var datosUsuario = null;

//if(localStorage === null || localStorage.getItem("usuario") === null){
//  window.location.href = "../404.html";
//}

if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
}

//if(datosUsuario.rolUser != "ADMIN" && datosUsuario.rolUser != "FIRMA"){
//    window.location.href = "../404.html";
//}

var thisDocName = "";
var userId = null;
var initialTimestampName = "";

var URLString = window.location.href.split('?');
var datosURL = URLString[1].split('&');
var idHTML = datosURL[0].replace("id=","");
var pageHTML = datosURL[1].replace("page=","");

async function returnDataOriginal() {

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    console.log("return data");
    return fetch(URLSERVERdetail + idHTML)
        .then((response) => { 
            return response.json().then((data) => {
                thisDocName = data[0].DocName;
                userId = data[0].userId;

                var initialTimestampNameAux = data[0].initialUploadTimestamp.slice(0, 19).replace('T', ' ');
                var initialTimestampNameAux2 = initialTimestampNameAux.replace(" ","_").replaceAll(":","-");
                initialTimestampName = initialTimestampNameAux2.replaceAll("-","_");

                return appendDataOriginal(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

async function retrievePDF() {

    console.log("retrieve pdf: " + URLSERVERretrieve + thisDocName + "/" + userId + "/" + initialTimestampName + "/" + "STAMP");
    return fetch(URLSERVERretrieve + thisDocName + "/" + userId + "/" + initialTimestampName + "/" + "STAMP", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then((response) => { 
        console.log(response);

        return response.blob().then((data) => {
                    //console.log(data);
                    return generateWindow(data);
                }).catch((err) => {
                    console.log(err);
                }) 

    });
    

}

//pdfs.id as pdfId, pdfs.name AS DocName, urlCarpeta, nameUser, userId
function appendDataOriginal(data){
    for(let i=0;i<data.length;i++){
        console.log(data[i]);

        thisDocName = data[i].DocName;                     

        var initialTimestampNameAux = data[0].initialUploadTimestamp.slice(0, 19).replace('T', ' ');
        var initialTimestampNameAux2 = initialTimestampNameAux.replace(" ","_").replaceAll(":","-");
        initialTimestampName = initialTimestampNameAux2.replaceAll("-","_");

    }
    console.log("finalizado generacion de ventana");
}

async function returnDataStamp() {
    const URLSERVERdetail = "http://localhost:3000/pdfStamp/";

    //var datosURL = window.location.href.split('?');
    //var idHTML = datosURL[1].replace("id=","");

    //console.log("return data");
    return fetch(URLSERVERdetail + idHTML)
        .then((response) => { 
            return response.json().then((data) => {
                return appendDataStamp(data);
            }).catch((err) => {
                console.log(err);
            }) 
        });

}

function appendDataStamp(data){

    var buttons = document.getElementById("button-container");

    var buttonCan = document.createElement("button");
    buttonCan.innerHTML = "Cancel";
    buttonCan.onclick = onbuttonclicked;
    buttons.appendChild(buttonCan);

    var con=document.getElementById("main-container");
    if(data.length !== 0){
        
        for(let i=0;i<data.length;i++){
            console.log(data[i]);

            var d=document.createElement("div");
            d.textContent="Doc Name: " + data[i].DocName;
            thisDocName = data[i].DocName;                     
            con.appendChild(d);

            var e=document.createElement("div")
            e.textContent="Doc URL: " + data[i].urlCarpeta                      
            con.appendChild(e);

            var f=document.createElement("div")
            f.textContent="Stamp User Name: " + data[i].nameUser                      
            con.appendChild(f);

            var g=document.createElement("div")
            g.textContent="Estado: " + data[i].estado                      
            con.appendChild(g);

            var h=document.createElement("div");

            var initialTimestampNameAux = data[0].initialUploadTimestamp.slice(0, 19).replace('T', ' ');
            var initialTimestampNameAux2 = initialTimestampNameAux.replace(" ","_").replaceAll(":","-");
            initialTimestampName = initialTimestampNameAux2.replaceAll("-","_");

            h.textContent="Creation DateTime: " + initialTimestampNameAux;                      
            con.appendChild(h);

            var k=document.createElement("div");
            var stampTimestampNameAux = data[0].stampTimestamp.slice(0, 19).replace('T', ' ');
            k.textContent="Stamp DateTime: " + stampTimestampNameAux;                      
            con.appendChild(k);

            //document.getElementById("submit").disabled = false;

            //if(data[0].stampUserId !== datosUsuario.id || data[0].atrexists === 0){
            //    document.getElementById("submit").disabled = true;
            //}   

        }
    }else{
        console.log("No hay documento estampado");

        var j=document.createElement("div");
        j.textContent="No hay documento estampado";
        con.appendChild(j);

        //document.getElementById("submit").disabled = true;
    }
    //console.log("finalizado generacion de ventana");
}

function onbuttonclicked() {
  //"location.href='table_pag.html?page=' + pageHTML";
  if (onbuttonclicked) {
    window.location.href = "table.html?page=" + pageHTML;
  }
}

function generateWindow(response){
    console.log(response);

    const fileURL = URL.createObjectURL(response);
    console.log(fileURL);
    window.open(fileURL);

}

function checkUserHosting(){

    //var idHTML = null;
    //var datosURL = window.location.href.split('?');
    //idHTML = datosURL[1].replace("id=","");

    if(idHTML === null || idHTML === ""){
        window.location.href = "table.html?page=1";
    }else{

        returnDataOriginal().then(() => {
            returnDataStamp();
        }).then(() => {
            retrievePDF();
        })
    }
    
}

checkUserHosting();
