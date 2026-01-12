(() => {
  // ../node_modules/@web-eid/web-eid-library/models/Action.js
  var Action;
  (function(Action2) {
    Action2["WARNING"] = "web-eid:warning";
    Action2["STATUS"] = "web-eid:status";
    Action2["STATUS_ACK"] = "web-eid:status-ack";
    Action2["STATUS_SUCCESS"] = "web-eid:status-success";
    Action2["STATUS_FAILURE"] = "web-eid:status-failure";
    Action2["AUTHENTICATE"] = "web-eid:authenticate";
    Action2["AUTHENTICATE_ACK"] = "web-eid:authenticate-ack";
    Action2["AUTHENTICATE_SUCCESS"] = "web-eid:authenticate-success";
    Action2["AUTHENTICATE_FAILURE"] = "web-eid:authenticate-failure";
    Action2["GET_SIGNING_CERTIFICATE"] = "web-eid:get-signing-certificate";
    Action2["GET_SIGNING_CERTIFICATE_ACK"] = "web-eid:get-signing-certificate-ack";
    Action2["GET_SIGNING_CERTIFICATE_SUCCESS"] = "web-eid:get-signing-certificate-success";
    Action2["GET_SIGNING_CERTIFICATE_FAILURE"] = "web-eid:get-signing-certificate-failure";
    Action2["SIGN"] = "web-eid:sign";
    Action2["SIGN_ACK"] = "web-eid:sign-ack";
    Action2["SIGN_SUCCESS"] = "web-eid:sign-success";
    Action2["SIGN_FAILURE"] = "web-eid:sign-failure";
  })(Action || (Action = {}));
  var Action_default = Action;

  // ../node_modules/@web-eid/web-eid-library/errors/ErrorCode.js
  var ErrorCode;
  (function(ErrorCode2) {
    ErrorCode2["ERR_WEBEID_ACTION_TIMEOUT"] = "ERR_WEBEID_ACTION_TIMEOUT";
    ErrorCode2["ERR_WEBEID_USER_TIMEOUT"] = "ERR_WEBEID_USER_TIMEOUT";
    ErrorCode2["ERR_WEBEID_VERSION_MISMATCH"] = "ERR_WEBEID_VERSION_MISMATCH";
    ErrorCode2["ERR_WEBEID_VERSION_INVALID"] = "ERR_WEBEID_VERSION_INVALID";
    ErrorCode2["ERR_WEBEID_EXTENSION_UNAVAILABLE"] = "ERR_WEBEID_EXTENSION_UNAVAILABLE";
    ErrorCode2["ERR_WEBEID_NATIVE_UNAVAILABLE"] = "ERR_WEBEID_NATIVE_UNAVAILABLE";
    ErrorCode2["ERR_WEBEID_UNKNOWN_ERROR"] = "ERR_WEBEID_UNKNOWN_ERROR";
    ErrorCode2["ERR_WEBEID_CONTEXT_INSECURE"] = "ERR_WEBEID_CONTEXT_INSECURE";
    ErrorCode2["ERR_WEBEID_USER_CANCELLED"] = "ERR_WEBEID_USER_CANCELLED";
    ErrorCode2["ERR_WEBEID_NATIVE_INVALID_ARGUMENT"] = "ERR_WEBEID_NATIVE_INVALID_ARGUMENT";
    ErrorCode2["ERR_WEBEID_NATIVE_FATAL"] = "ERR_WEBEID_NATIVE_FATAL";
    ErrorCode2["ERR_WEBEID_ACTION_PENDING"] = "ERR_WEBEID_ACTION_PENDING";
    ErrorCode2["ERR_WEBEID_MISSING_PARAMETER"] = "ERR_WEBEID_MISSING_PARAMETER";
  })(ErrorCode || (ErrorCode = {}));
  var ErrorCode_default = ErrorCode;

  // ../node_modules/@web-eid/web-eid-library/errors/MissingParameterError.js
  var MissingParameterError = class extends Error {
    constructor(message) {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_MISSING_PARAMETER;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/ActionPendingError.js
  var ActionPendingError = class extends Error {
    constructor(message = "same action for Web-eID browser extension is already pending") {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_ACTION_PENDING;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/ActionTimeoutError.js
  var ActionTimeoutError = class extends Error {
    constructor(message = "extension message timeout") {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_ACTION_TIMEOUT;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/ContextInsecureError.js
  var SECURE_CONTEXTS_INFO_URL = "https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts";
  var ContextInsecureError = class extends Error {
    constructor(message = "Secure context required, see " + SECURE_CONTEXTS_INFO_URL) {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_CONTEXT_INSECURE;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/ExtensionUnavailableError.js
  var ExtensionUnavailableError = class extends Error {
    constructor(message = "Web-eID extension is not available") {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_EXTENSION_UNAVAILABLE;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/config.js
  var config_default = Object.freeze({
    VERSION: "2.0.2",
    EXTENSION_HANDSHAKE_TIMEOUT: 1e3,
    NATIVE_APP_HANDSHAKE_TIMEOUT: 5 * 1e3,
    DEFAULT_USER_INTERACTION_TIMEOUT: 2 * 60 * 1e3,
    MAX_EXTENSION_LOAD_DELAY: 1e3
    // 1 second
  });

  // ../node_modules/@web-eid/web-eid-library/errors/NativeFatalError.js
  var NativeFatalError = class extends Error {
    constructor(message = "native application terminated with a fatal error") {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_NATIVE_FATAL;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/NativeInvalidArgumentError.js
  var NativeInvalidArgumentError = class extends Error {
    constructor(message = "native application received an invalid argument") {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_NATIVE_INVALID_ARGUMENT;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/NativeUnavailableError.js
  var NativeUnavailableError = class extends Error {
    constructor(message = "Web-eID native application is not available") {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_NATIVE_UNAVAILABLE;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/UnknownError.js
  var UnknownError = class extends Error {
    constructor(message = "an unknown error occurred") {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_UNKNOWN_ERROR;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/UserCancelledError.js
  var UserCancelledError = class extends Error {
    constructor(message = "request was cancelled by the user") {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_USER_CANCELLED;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/UserTimeoutError.js
  var UserTimeoutError = class extends Error {
    constructor(message = "user failed to respond in time") {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_USER_TIMEOUT;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/VersionInvalidError.js
  var VersionInvalidError = class extends Error {
    constructor(message = "invalid version string") {
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_VERSION_INVALID;
    }
  };

  // ../node_modules/@web-eid/web-eid-library/errors/VersionMismatchError.js
  function tmpl(strings, requiresUpdate) {
    return `Update required for Web-eID ${requiresUpdate}`;
  }
  var VersionMismatchError = class extends Error {
    constructor(message, versions, requiresUpdate) {
      if (!message) {
        if (!requiresUpdate) {
          message = "requiresUpdate not provided";
        } else if (requiresUpdate.extension && requiresUpdate.nativeApp) {
          message = tmpl`${"extension and native app"}`;
        } else if (requiresUpdate.extension) {
          message = tmpl`${"extension"}`;
        } else if (requiresUpdate.nativeApp) {
          message = tmpl`${"native app"}`;
        }
      }
      super(message);
      this.name = this.constructor.name;
      this.code = ErrorCode_default.ERR_WEBEID_VERSION_MISMATCH;
      this.requiresUpdate = requiresUpdate;
      if (versions) {
        const { library, extension, nativeApp } = versions;
        Object.assign(this, { library, extension, nativeApp });
      }
    }
  };

  // ../node_modules/@web-eid/web-eid-library/utils/errorSerializer.js
  var errorCodeToErrorClass = {
    [ErrorCode_default.ERR_WEBEID_ACTION_PENDING]: ActionPendingError,
    [ErrorCode_default.ERR_WEBEID_ACTION_TIMEOUT]: ActionTimeoutError,
    [ErrorCode_default.ERR_WEBEID_CONTEXT_INSECURE]: ContextInsecureError,
    [ErrorCode_default.ERR_WEBEID_EXTENSION_UNAVAILABLE]: ExtensionUnavailableError,
    [ErrorCode_default.ERR_WEBEID_NATIVE_INVALID_ARGUMENT]: NativeInvalidArgumentError,
    [ErrorCode_default.ERR_WEBEID_NATIVE_FATAL]: NativeFatalError,
    [ErrorCode_default.ERR_WEBEID_NATIVE_UNAVAILABLE]: NativeUnavailableError,
    [ErrorCode_default.ERR_WEBEID_USER_CANCELLED]: UserCancelledError,
    [ErrorCode_default.ERR_WEBEID_USER_TIMEOUT]: UserTimeoutError,
    [ErrorCode_default.ERR_WEBEID_VERSION_INVALID]: VersionInvalidError,
    [ErrorCode_default.ERR_WEBEID_VERSION_MISMATCH]: VersionMismatchError
  };
  function deserializeError(errorObject) {
    let error;
    if (typeof errorObject.code == "string" && errorObject.code in errorCodeToErrorClass) {
      const CustomError = errorCodeToErrorClass[errorObject.code];
      error = new CustomError();
    } else {
      error = new UnknownError();
    }
    for (const [key, value] of Object.entries(errorObject)) {
      error[key] = value;
    }
    return error;
  }

  // ../node_modules/@web-eid/web-eid-library/services/WebExtensionService.js
  var WebExtensionService = class {
    constructor() {
      this.loggedWarnings = [];
      this.queue = [];
      window.addEventListener("message", (event) => this.receive(event));
    }
    receive(event) {
      var _a, _b, _c, _d, _e, _f;
      if (!/^web-eid:/.test((_a = event.data) === null || _a === void 0 ? void 0 : _a.action))
        return;
      const message = event.data;
      const suffix = (_c = (_b = message.action) === null || _b === void 0 ? void 0 : _b.match(/success$|failure$|ack$/)) === null || _c === void 0 ? void 0 : _c[0];
      const initialAction = this.getInitialAction(message.action);
      const pending = this.getPendingMessage(initialAction);
      if (message.action === Action_default.WARNING) {
        (_d = message.warnings) === null || _d === void 0 ? void 0 : _d.forEach((warning) => {
          if (!this.loggedWarnings.includes(warning)) {
            this.loggedWarnings.push(warning);
            console.warn(warning.replace(/\n|\r/g, ""));
          }
        });
      } else if (pending) {
        switch (suffix) {
          case "ack": {
            clearTimeout(pending.ackTimer);
            break;
          }
          case "success": {
            this.removeFromQueue(initialAction);
            (_e = pending.resolve) === null || _e === void 0 ? void 0 : _e.call(pending, message);
            break;
          }
          case "failure": {
            const failureMessage = message;
            this.removeFromQueue(initialAction);
            (_f = pending.reject) === null || _f === void 0 ? void 0 : _f.call(pending, failureMessage.error ? deserializeError(failureMessage.error) : failureMessage);
            break;
          }
        }
      }
    }
    send(message, timeout) {
      if (this.getPendingMessage(message.action)) {
        return Promise.reject(new ActionPendingError());
      } else if (!window.isSecureContext) {
        return Promise.reject(new ContextInsecureError());
      } else {
        const pending = { message };
        this.queue.push(pending);
        pending.promise = new Promise((resolve, reject) => {
          pending.resolve = resolve;
          pending.reject = reject;
        });
        pending.ackTimer = window.setTimeout(() => this.onAckTimeout(pending), config_default.EXTENSION_HANDSHAKE_TIMEOUT);
        pending.replyTimer = window.setTimeout(() => this.onReplyTimeout(pending), timeout);
        window.postMessage(message, "*");
        return pending.promise;
      }
    }
    onReplyTimeout(pending) {
      var _a;
      this.removeFromQueue(pending.message.action);
      (_a = pending.reject) === null || _a === void 0 ? void 0 : _a.call(pending, new ActionTimeoutError());
    }
    onAckTimeout(pending) {
      var _a;
      clearTimeout(pending.replyTimer);
      this.removeFromQueue(pending.message.action);
      (_a = pending.reject) === null || _a === void 0 ? void 0 : _a.call(pending, new ExtensionUnavailableError());
    }
    getPendingMessage(action) {
      return this.queue.find((pm) => {
        return pm.message.action === action;
      });
    }
    getInitialAction(action) {
      return action.replace(/-success$|-failure$|-ack$/, "");
    }
    removeFromQueue(action) {
      const pending = this.getPendingMessage(action);
      clearTimeout(pending === null || pending === void 0 ? void 0 : pending.replyTimer);
      this.queue = this.queue.filter((pending2) => pending2.message.action !== action);
    }
  };

  // ../node_modules/@web-eid/web-eid-library/utils/sleep.js
  function sleep(milliseconds) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), milliseconds);
    });
  }

  // ../node_modules/@web-eid/web-eid-library/web-eid.js
  var webExtensionService = new WebExtensionService();
  var initializationTime = +/* @__PURE__ */ new Date();
  async function extensionLoadDelay() {
    const now = +/* @__PURE__ */ new Date();
    await sleep(initializationTime + config_default.MAX_EXTENSION_LOAD_DELAY - now);
  }
  async function authenticate(challengeNonce, options) {
    await extensionLoadDelay();
    if (!challengeNonce) {
      throw new MissingParameterError("authenticate function requires a challengeNonce");
    }
    const timeout = config_default.EXTENSION_HANDSHAKE_TIMEOUT + config_default.NATIVE_APP_HANDSHAKE_TIMEOUT + ((options === null || options === void 0 ? void 0 : options.userInteractionTimeout) || config_default.DEFAULT_USER_INTERACTION_TIMEOUT);
    const message = {
      action: Action_default.AUTHENTICATE,
      libraryVersion: config_default.VERSION,
      challengeNonce,
      options
    };
    const { unverifiedCertificate, algorithm, signature, format, appVersion } = await webExtensionService.send(message, timeout);
    return {
      unverifiedCertificate,
      algorithm,
      signature,
      format,
      appVersion
    };
  }
  async function getSigningCertificate(options) {
    await extensionLoadDelay();
    const timeout = config_default.EXTENSION_HANDSHAKE_TIMEOUT + config_default.NATIVE_APP_HANDSHAKE_TIMEOUT + ((options === null || options === void 0 ? void 0 : options.userInteractionTimeout) || config_default.DEFAULT_USER_INTERACTION_TIMEOUT) * 2;
    const message = {
      action: Action_default.GET_SIGNING_CERTIFICATE,
      libraryVersion: config_default.VERSION,
      options
    };
    const { certificate, supportedSignatureAlgorithms } = await webExtensionService.send(message, timeout);
    return {
      certificate,
      supportedSignatureAlgorithms
    };
  }
  async function sign(certificate, hash, hashFunction, options) {
    await extensionLoadDelay();
    if (!certificate) {
      throw new MissingParameterError("sign function requires a certificate as parameter");
    }
    if (!hash) {
      throw new MissingParameterError("sign function requires a hash as parameter");
    }
    if (!hashFunction) {
      throw new MissingParameterError("sign function requires a hashFunction as parameter");
    }
    const timeout = config_default.EXTENSION_HANDSHAKE_TIMEOUT + config_default.NATIVE_APP_HANDSHAKE_TIMEOUT + ((options === null || options === void 0 ? void 0 : options.userInteractionTimeout) || config_default.DEFAULT_USER_INTERACTION_TIMEOUT) * 2;
    const message = {
      action: Action_default.SIGN,
      libraryVersion: config_default.VERSION,
      certificate,
      hash,
      hashFunction,
      options
    };
    const { signature, signatureAlgorithm } = await webExtensionService.send(message, timeout);
    return {
      signature,
      signatureAlgorithm
    };
  }

  // firmadoDigitalCliente.jsx

  if(localStorage.getItem("usuario") !== null){
    datosUsuario = JSON.parse(localStorage.getItem("usuario"));
  }

  var URLString = window.location.href.split('?');
  var datosURL = URLString[1].split('&');
  var idHTML = datosURL[0].replace("id=","");
  var pageHTML = datosURL[1].replace("page=","");

  var idUser = datosUsuario.id;


  //var lang = navigator.language.substr(0, 2);
  var lang = "en"

  function getCookie(name) {
  if (!document.cookie) {
    return null;
  }

  const xsrfCookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(name + '='));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}

const csrfToken = getCookie('CSRF-TOKEN');

/*const headers = new Headers({
        'Content-Type': 'x-www-form-urlencoded',
        'X-CSRF-TOKEN': csrfToken
    });*/


  var authButton = document.querySelector("#webeid-auth-button");
  authButton.addEventListener("click", async () => {
    try {
      const challengeResponse = await fetch("http://localhost:3000/auth/challenge", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("challengeResponse: " + challengeResponse);
      if (!challengeResponse.ok) {
        throw new Error("GET /auth/challenge server error: " + challengeResponse.status);
      }

      const { nonce } = await challengeResponse.json();

      //console.log("challengeResponse json: " + challengeResponse.json());
      console.log("nonce: " + nonce);
      console.log("lang: " + lang);

      try {
        const authToken = await authenticate(nonce, { lang });

        console.log("authToken: " + authToken);

      } catch (error) {

        if (error.code === "ERR_WEBEID_USER_CANCELLED") {
          alert("Debe introducir la contraseña de la tarjeta para autenticarse.");
        } else if (error.code === "ERR_WEBEID_USER_TIMEOUT") {
          alert("No respondió a tiempo. Intente nuevamente con su tarjeta.");
        } else {
          alert("Error en la autenticación: " + error.message);
        }
          console.error(error);
          return;// Salir de la funcion si hay un error de autenticacion
      }


      const authTokenResponse = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          //[csrfHeaderName]: csrfToken
          "csrfHeaderName": csrfToken
        },
        body: JSON.stringify({ authToken })
      });
      console.log("authTokenResponse: " + authTokenResponse);
      if (!authTokenResponse.ok) {
        throw new Error("POST /auth/login server error: " + authTokenResponse.status);
      }
      const authTokenResult = await authTokenResponse.json();
      console.log("authTokenResult: " + authTokenResult);
      console.log("Authentication successful! Result:", authTokenResult);
      window.location.href = "table.html?page=" + pageHTML;
    } catch (error) {
      console.log("Authentication failed! Error:", error);
      throw error;
    }
  });

  var signButton = document.querySelector("#webeid-sign-button");
  signButton.addEventListener("click", async () => {
      try {
          const {
              certificate,
              supportedSignatureAlgorithms
          } = await getSigningCertificate({ lang });

          console.log("Lang: " + lang);
          console.log("Certificate: " + certificate);
          console.log("Signature Algoritm: " + supportedSignatureAlgorithms);

          const prepareSigningResponse = await fetch("http://localhost:3000/sign/prepare/" + idHTML, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  //[csrfHeaderName]: csrfToken
                  "csrfHeaderName": csrfToken
              },
              body: JSON.stringify({ certificate, supportedSignatureAlgorithms })
          });

          if (!prepareSigningResponse.ok) {
              throw new Error("POST /sign/prepare server error: " + prepareSigningResponse.status);
          }

            const prepareSigningJson = await prepareSigningResponse.json();
            const { hash, hashFunction } = prepareSigningJson;

            console.log("Certificate: " + certificate);
            console.log("Hash: " + hash);
            console.log("Hash function: " + hashFunction);

            if (!hash) {
              console.error("Server returned null/empty hash for signing:", prepareSigningJson);
              alert("Signing aborted: server returned an empty hash. Check server logs or try again.");
              return;
            }

            const { signature, signatureAlgorithm } = await sign(certificate, hash, hashFunction, { lang });

            console.log("signature: " + signature);
            console.log("signatureAlgorithm: " + signatureAlgorithm);

          const finalizeSigningResponse = await fetch("http://localhost:3000/sign/finalize/" + idHTML, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  //[csrfHeaderName]: csrfToken
                  "csrfHeaderName": csrfToken

              },
              body: JSON.stringify({ signature, signatureAlgorithm, certificate})
          });

          if (!finalizeSigningResponse.ok) {
              throw new Error("POST /sign/finalize server error: " + finalizeSigningResponse.status);
          }

          const signResult = await finalizeSigningResponse.json();
          console.log("Signing successful! Response:", signResult);
        } catch (error) {
          console.log("Signing failed! Error:", error);
          try {
            alert("Signing failed: " + (error && error.message ? error.message : error));
          } catch (e) {
            // ignore alert failures
          }
          return;
        }
  });


  var certButton = document.querySelector("#webeid-cert-button");
  certButton.addEventListener("click", async () => {
  try {
    const { certificate, supportedSignatureAlgorithms } = await getSigningCertificate({ lang });

    console.log("Lang: " + lang);
    console.log("Certificate: " + certificate);
    console.log("Signature Algoritm: " + supportedSignatureAlgorithms);

    console.log("Certificate obtained:", certificate);
    //TODO mostrar el certificado en pantalla?
  } catch (error) {
    console.log("Certificate failed! Error:", error);
  }
});


})();

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

