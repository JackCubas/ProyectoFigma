// pades_sign.js
// Create PKCS#7 (CMS) detached signature for the current PDF buffer using a PKCS#12 (PFX) uploaded by the user.

async function padesSign(){
    try{
        if(!pdfBuffer){
            alert('PDF not loaded yet. Please wait and retry.');
            return;
        }

        const p12input = document.getElementById('p12file');
        const password = document.getElementById('p12password').value || '';

        if(!p12input || p12input.files.length === 0){
            alert('Please select a .p12/.pfx file containing your certificate and private key.');
            return;
        }

        const p12file = p12input.files[0];
        const arrayBuffer = await p12file.arrayBuffer();
        const binary = arrayBufferToBinaryString(arrayBuffer);
        const p12Der = forge.util.createBuffer(binary, 'binary');
        const p12Asn1 = forge.asn1.fromDer(p12Der);

        let p12;
        try{
            p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
        }catch(err){
            alert('Unable to parse PKCS#12. Check password and file.');
            console.error(err);
            return;
        }

        // Extract private key and certificate
        let privateKey = null;
        let certificate = null;

        for(const safeContent of p12.safeContents){
            for(const safeBag of safeContent.safeBags){
                if(safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag || safeBag.type === forge.pki.oids.keyBag){
                    privateKey = safeBag.key;
                } else if(safeBag.type === forge.pki.oids.certBag){
                    certificate = safeBag.cert;
                }
            }
        }

        if(!privateKey || !certificate){
            alert('Could not extract key or certificate from the PKCS#12 file.');
            return;
        }

        // Prepare PDF content for signing (we will create a detached PKCS#7 over the full PDF bytes)
        const pdfBytes = new Uint8Array(pdfBuffer);
        const pdfBinary = uint8ArrayToBinaryString(pdfBytes);

        // Create PKCS#7 signedData (detached)
        const p7 = forge.pkcs7.createSignedData();
        p7.content = forge.util.createBuffer(pdfBinary, 'binary');

        p7.addCertificate(certificate);
        p7.addSigner({
            key: privateKey,
            certificate: certificate,
            digestAlgorithm: forge.pki.oids.sha256,
            authenticatedAttributes: [
                {type: forge.pki.oids.contentType, value: forge.pki.oids.data},
                {type: forge.pki.oids.messageDigest},
                {type: forge.pki.oids.signingTime, value: new Date()}
            ]
        });

        p7.sign({detached: true});

        const raw = forge.asn1.toDer(p7.toAsn1()).getBytes();
        const pkcs7b64 = forge.util.encode64(raw);

        // Certificate in PEM
        const certPem = forge.pki.certificateToPem(certificate);

        // ByteRange placeholder: actual ByteRange must be computed when embedding the signature
        // Provide a conservative placeholder for now (server should compute exact ranges when inserting)
        const byteRange = [0, pdfBytes.length];

        // Signature dictionary metadata (/Sig) and placeholder length for /Contents
        const SIG_PLACEHOLDER_LENGTH = 8192; // bytes reserved for hex-encoded PKCS#7 (server may need to adjust)
        const sigDict = {
            Type: '/Sig',
            Filter: '/Adobe.PPKLite',
            SubFilter: '/adbe.pkcs7.detached',
            ByteRange: byteRange,
            ContentsLength: SIG_PLACEHOLDER_LENGTH,
            Reason: (typeof datosUsuario !== 'undefined' && datosUsuario && datosUsuario.name) ? ('Signed by ' + datosUsuario.name) : 'Document signed',
            M: new Date().toISOString()
        };

        // Send to server for embedding into PDF (server must implement embedding to produce final PAdES)
        const URLSERVERpades = 'http://localhost:3000/signPades/'; // server endpoint expected to handle embedding

        const formData = new FormData();
        formData.append('filename', thisDocName || 'document.pdf');
        formData.append('pkcs7', pkcs7b64);
        formData.append('certificate', certPem);
        formData.append('byteRange', JSON.stringify(byteRange));
        formData.append('sigDict', JSON.stringify(sigDict));
        formData.append('originalUserId', userId || '');
        formData.append('signUserId', (typeof datosUsuario !== 'undefined' && datosUsuario && datosUsuario.id) ? datosUsuario.id : '');

        // Also send the original PDF so the server can embed the signature precisely
        const originalBlob = new Blob([pdfBuffer], {type: 'application/pdf'});
        formData.append('uploadedFile', originalBlob);

        const response = await fetch(URLSERVERpades + idHTML, {
            method: 'PUT',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json().catch(() => null);
        console.log('signPades result', result);

        if(!result || result.status === 400 || result.status === 500 || result.hasOwnProperty('error')){
            alert('PAdES signing failed (server embedding). Check server logs.');
        }else{
            alert('PAdES signature created and sent to server successfully.');
            // Optionally redirect or refresh
            window.location.href = 'table.html?page=' + pageHTML;
        }

    }catch(err){
        console.error(err);
        alert('An error occurred during PAdES signing. See console for details.');
    }
}

function arrayBufferToBinaryString(ab){
    const bytes = new Uint8Array(ab);
    let str = '';
    const chunk = 0x8000;
    for(let i = 0; i < bytes.length; i += chunk){
        const sub = bytes.subarray(i, i + chunk);
        str += String.fromCharCode.apply(null, sub);
    }
    return str;
}

function uint8ArrayToBinaryString(u8){
    let str = '';
    const chunk = 0x8000;
    for(let i = 0; i < u8.length; i += chunk){
        const sub = u8.subarray(i, i + chunk);
        str += String.fromCharCode.apply(null, sub);
    }
    return str;
}

