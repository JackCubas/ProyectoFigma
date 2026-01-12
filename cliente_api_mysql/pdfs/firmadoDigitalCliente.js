import * as webeid from '@web-eid/web-eid-library/web-eid.js';
import * as webeid from "web-eid";


const lang = navigator.language.substr(0, 2);
const authButton = document.querySelector("#webeid-auth-button");

authButton.addEventListener("click", async () => {
    try {
        const challengeResponse = await fetch("/auth/challenge", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (!challengeResponse.ok) {
            throw new Error("GET /auth/challenge server error: " +
                            challengeResponse.status);
        }
        const {nonce} = await challengeResponse.json();
        
        const authToken = await webeid.authenticate(nonce, {lang});
        
        const authTokenResponse = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                [csrfHeaderName]: csrfToken
            },
            body: JSON.stringify({authToken})
        });
        if (!authTokenResponse.ok) {
            throw new Error("POST /auth/login server error: " +
                            authTokenResponse.status);
        }
        const authTokenResult = await authTokenResponse.json();
        
        console.log("Authentication successful! Result:", authTokenResult);

        window.location.href = "/welcome";

    } catch (error) {
        console.log("Authentication failed! Error:", error);
        throw error;
    }
});

const signButton = document.querySelector("#webeid-sign-button");

signButton.addEventListener("click", async () => {
    try {
        const {
            certificate,
            supportedSignatureAlgorithms
        } = await webeid.getSigningCertificate({lang});
        
        const prepareSigningResponse = await fetch("/sign/prepare", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                [csrfHeaderName]: csrfToken
            },
            body: JSON.stringify({certificate, supportedSignatureAlgorithms}),
        });
        if (!prepareSigningResponse.ok) {
            throw new Error("POST /sign/prepare server error: " +
                            prepareSigningResponse.status);
        }
        const {
            hash,
            hashFunction
        } = await prepareSigningResponse.json();

        const {
            signature,
            signatureAlgorithm
        } = await webeid.sign(certificate, hash, hashFunction, {lang});
        
        const finalizeSigningResponse = await fetch("/sign/finalize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                [csrfHeaderName]: csrfToken
            },
            body: JSON.stringify({signature, signatureAlgorithm}),
        });
        if (!finalizeSigningResponse.ok) {
            throw new Error("POST /sign/finalize server error: " +
                            finalizeSigningResponse.status);
        }
        const signResult = await finalizeSigningResponse.json();

        console.log("Signing successful! Response:", response);
        // display successful signing message to user

    } catch (error) {
        console.log("Signing failed! Error:", error);
        throw error;
    }
});