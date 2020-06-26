function base64ToArrayBuffer(base64) {
    let binary_string = atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function bufferToString(buffer) {
    let convertFn = (prev, curr) => prev + String.fromCodePoint(curr);
    return (new Uint8Array(buffer)).reduce(convertFn, '');
}

function toBase64URL(s) {
    s = s.split('=')[0]; // Remove any trailing '='s
    s = s.replace(/\+/g, '-'); // 62nd char of encoding
    s = s.replace(/\//g, '_'); // 63rd char of encoding
    return s
}

function fromBase64URL(input) {
    // Replace non-url compatible chars with base64 standard chars
    input = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // Pad out with standard base64 required padding characters
    var pad = input.length % 4;
    if (pad) {
        if (pad === 1) {
            throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
        }
        input += new Array(5 - pad).join('=');
    }

    return input;
}

function isWebAuthnSupported() {
    if (window.PublicKeyCredential === undefined ||
        typeof window.PublicKeyCredential !== "function") {
        return false;
    }
    else{
        return true;
    }
}

function getFido2DeviceForUser(user, userInfoApiUrl, accessToken, callback){

    fetch(userInfoApiUrl, {
        method: "GET",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken
        }
    })
        .then((response) => response.json())
        .then((data) => {
            console.log('Authenticators Registered for: ' + user, data);
            callback(data);
        })
        .catch((error) => {
            console.error('Error Getting Authenticators for: ' + user, error);
            callback(error);
        });
}

function deleteDeviceRegistration(keyId, fido2ServerUrl, accessToken){

    fetch(fido2ServerUrl + "/rp/api/versioned/fido2/user?keyId=" + keyId, {
        method: "DELETE",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken
        }
    })
        .then((response) => response.json())
        .then((data) => {
            alert("keyId (" + keyId + ") has been removed from FIDO2 Server: " + JSON.stringify(data));
            console.log('Authenticator Deregistered for: ' + keyId, data);
        })
        .catch((error) => {
            alert("Error removing keyId (" + keyId + ") from FIDO2 Server: " + error);
            console.error('Error Deregistering Authenticator for: ' + keyId, error);
        });
}
/**
 * This is the HYPR FIDO2 Client SDK.
 * This SDK should be used by developers who want to interact with the underlying WebAuthn APIs in a simple abstract way.
 *
 * @type {{useFido2Credential: HYPRFido2Client.useFido2Credential, makePublicKey: (function(*): {publicKey: {attestation: (string|any|AttestationConveyancePreference), challenge, authenticatorSelection: ({authenticatorAttachment: string, userVerification: string, requireResidentKey: boolean}|{authenticatorAttachment: string, userVerification: string, requireResidentKey: boolean}|{authenticatorAttachment: string}|{authenticatorAttachment: string}|{authenticatorAttachment: string}|{authenticatorAttachment: string}|*|AuthenticatorSelectionCriteria), user: {displayName: string, name: string, id}, excludeCredentials: *, rp: PublicKeyCredentialRpEntity, timeout: (number|ProgressEvent<XMLHttpRequestEventTarget>|null), pubKeyCredParams: PublicKeyCredentialParameters[]}}), createAttestationOptions: (function(*=, *=, *=, *=, *=, *=): {attestation: string, displayName: *, authenticatorSelection: {authenticatorAttachment: string, userVerification: string, requireResidentKey: boolean}, username: *}), createFido2Credential: HYPRFido2Client.createFido2Credential, createAssertionOptions: (function(*=, *=, *=): {userVerification: string, authenticatorSelection: {authenticatorAttachment: string}, username: *})}}
 */
const HYPRFido2Client = {

    /**
     * This is the function you should call to get the payload that you need to send to the FIDO2 server options
     * endpoint for registration
     * @param username - The username of the user you'd like to register
     * @param displayName - The display name of the user you'd like to register
     * @param authenticatorAttachment - The authenticator attachment for this registration - default is "platform"
     * @param userVerification - The user verification type for this registration - default is "required"
     * @param isResidentKeyRequired - Whether or not to use a resident key - default is false
     * @param attestationType - The attestation type to use for registration - default is "direct"
     * @returns {{attestation: *, displayName: *, authenticatorSelection: {authenticatorAttachment: *, userVerification: *, requireResidentKey: *}, username: *}}
     */
    createAttestationOptions: function (username,
                                        displayName,
                                        authenticatorAttachment = "platform",
                                        userVerification = "required",
                                        isResidentKeyRequired = false,
                                        attestationType = "direct") {
        return {
            "username": username,
            "displayName": displayName,
            "authenticatorSelection": {
                "authenticatorAttachment": authenticatorAttachment,
                "userVerification": userVerification,
                "requireResidentKey": isResidentKeyRequired
            },
            "attestation": attestationType
        }
    },

    /**
     * This function should be called when you need to make an options request to your FIDO2 server for authentication
     * @param username - The username for this particular user
     * @param userVerification - The user verification type - default is "preferred'
     * @param authenticatorAttachment - The authenticator attachment type - default is "platform"
     * @returns {{userVerification: *, authenticatorSelection: {authenticatorAttachment: *}, username: *}}
     */
    createAssertionOptions: function (username,
                                      userVerification = "preferred",
                                      authenticatorAttachment = "platform") {
        return {
            "username": username,
            "userVerification": userVerification,
            "authenticatorSelection": {
                "authenticatorAttachment": authenticatorAttachment
            }
        };
    },

    /**
     * This function should be called when you are doing registration with FIDO2
     * @param serverAttestationOptionsResponse - This is the options response from the attestation FIDO2 options request.
     * @param callback - This is your callback function that will be invoked in the event of an error or successful completion.
     */
    createFido2Credential: function (serverAttestationOptionsResponse, callback, removeExcludeCredentials = true) {

        function createAttestationResult(credCreateResult){
            return {
                id: credCreateResult.id,
                rawId: toBase64URL(btoa(bufferToString(credCreateResult.rawId))),
                type: "public-key",
                response: {
                    clientDataJSON: toBase64URL(btoa(bufferToString(credCreateResult.response.clientDataJSON))),
                    attestationObject: toBase64URL(btoa(bufferToString(credCreateResult.response.attestationObject)))
                }
            };
        }

        if(HYPRFido2Client.checkWebAuthnSupport(callback)) {
            if(serverAttestationOptionsResponse.authenticatorSelection.authenticatorAttachment === "platform"){
                PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                    .then(function(available){
                        if(available){
                            navigator.credentials.create(HYPRFido2Client.makePublicKey(serverAttestationOptionsResponse, removeExcludeCredentials)).then(res => {
                                callback(null, createAttestationResult(res))
                            }).catch(err => {
                                console.error("Error processing credential create request for WebAuthn with code: " + err.code +
                                    " and message: " + err.message + " and name: " + err.name);
                                callback(err);
                            });

                        } else {
                            const error = new Error("Cannot continue since WebAuthn Platform Authentication is not available on this browser and client");
                            error.name = "WebAuthnPlatformUnavailable";
                            callback(error);
                        }
                    }).catch(err => {
                        console.error("Error processing credential create request for WebAuthn with code: " + err.code +
                            " and message: " + err.message + " and name: " + err.name);
                        callback(err);
                    });
            }
            else {
                navigator.credentials.create(HYPRFido2Client.makePublicKey(serverAttestationOptionsResponse)).then(res => {
                    callback(null, createAttestationResult(res))
                }).catch(err => {
                    console.error("Error processing credential GET request for WebAuthn with code: " + err.code +
                        " and message: " + err.message + " and name: " + err.name);
                    callback(err);
                });
            }
        }
        else{
            const error = new Error("Cannot continue since WebAuthn is not available on this browser and client");
            error.name = "WebAuthnUnavailable";
            callback(error);
        }
    },

    /**
     * This function should be called when you are doing authentication with FIDO2
     * @param serverAssertionOptionsResponse - This is the JSON response of your assertion options request to the FIDO2 server
     * @param callback - This is your callback function that will be invoked in the event of an error or successful completion.
     */
    useFido2Credential: function (serverAssertionOptionsResponse, callback) {
        if(HYPRFido2Client.checkWebAuthnSupport(callback)) {
            navigator.credentials.get({
                publicKey: {
                    challenge: base64ToArrayBuffer(fromBase64URL(serverAssertionOptionsResponse.challenge)),
                    timeout: serverAssertionOptionsResponse.timeout,
                    rpId: serverAssertionOptionsResponse.rpId,
                    userVerification: serverAssertionOptionsResponse.userVerification,
                    allowCredentials: serverAssertionOptionsResponse.allowCredentials && serverAssertionOptionsResponse.allowCredentials.map(cred => {
                        cred.id = base64ToArrayBuffer(fromBase64URL(cred.id));
                        return cred;
                    })
                }
            }).then(resp => {
                let authReq = {
                    id: resp.id,
                    rawId: toBase64URL(btoa(bufferToString(resp.rawId))),
                    type: resp.type,
                    response: {
                        authenticatorData: toBase64URL(btoa(bufferToString(resp.response.authenticatorData))),
                        clientDataJSON: toBase64URL(btoa(bufferToString(resp.response.clientDataJSON))),
                        signature: toBase64URL(btoa(bufferToString(resp.response.signature))),
                        userHandle: toBase64URL(btoa(bufferToString(resp.response.userHandle)))
                    }
                };

                callback(null, authReq);
            }).catch(err => {
                console.error("Error processing credential assertion request for WebAuthn with code: " + err.code +
                    " and message: " + err.message + " and name: " + err.name);
                callback(err);
            });
        }
    },

    /**
     *
     * @param attOptionsResp PublicKeyCredentialCreationOptions
     * @returns {{publicKey: {attestation: (string|any|AttestationConveyancePreference), challenge, authenticatorSelection: ({authenticatorAttachment: string, userVerification: string, requireResidentKey: boolean}|{authenticatorAttachment: string, userVerification: string, requireResidentKey: boolean}|{authenticatorAttachment: string}|{authenticatorAttachment: string}|AuthenticatorSelectionCriteria), user: {displayName: string, name: string, id}, rp: PublicKeyCredentialRpEntity, timeout: (number|ProgressEvent<XMLHttpRequestEventTarget>|null), pubKeyCredParams: PublicKeyCredentialParameters[]}}}
     */
    makePublicKey: function (attOptionsResp, removeExcludeCredentials) {

        if (attOptionsResp.excludeCredentials) {
            attOptionsResp.excludeCredentials = attOptionsResp.excludeCredentials.map(function (cred) {
                cred.id = base64ToArrayBuffer(fromBase64URL(cred.id));
                cred.transports = ["internal", "usb", "ble", "nfc"];
                return cred;
            });
        }

        if(removeExcludeCredentials){
            attOptionsResp.excludeCredentials = [];
        }

        return {
            publicKey: {
                attestation: attOptionsResp.attestation,
                authenticatorSelection: attOptionsResp.authenticatorSelection,
                excludeCredentials: attOptionsResp.excludeCredentials,
                // Relying Party
                rp: attOptionsResp.rp,
                // User
                user: {
                    id: base64ToArrayBuffer(fromBase64URL(attOptionsResp.user.id)),
                    name: attOptionsResp.user.name,
                    displayName: attOptionsResp.user.displayName,
                },
                // Requested format of new keypair
                pubKeyCredParams: attOptionsResp.pubKeyCredParams,
                timeout: attOptionsResp.timeout,
                challenge: base64ToArrayBuffer(fromBase64URL(attOptionsResp.challenge))
            }
        }
    },

    /**
     *
     * @param callback - The callback that gets invoked as a result of this check.
     * @param requirePlatformAuthenticator - Whether or not to check if a platform authenticator is available at the same time. Default value is true
     */
    isFido2Available(callback, requirePlatformAuthenticator = true){

        const isWebAuthnAvailable = HYPRFido2Client.checkWebAuthnSupport();
        if(!isWebAuthnAvailable){
            const error = new Error("Cannot continue since WebAuthn is not available on this browser and client");
            error.name = "WebAuthnUnavailable";
            callback(error, false)
        }
        else{
            if(requirePlatformAuthenticator) {
                PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
                    .then(function (available) {
                        if (available) {
                            callback(null, true);
                        } else {
                            const error = new Error("Cannot continue since WebAuthn Platform Authentication is not available on this browser and client");
                            error.name = "WebAuthnPlatformUnavailable";
                            callback(error, false);
                        }
                    })
            }
            else{
                callback(null, true);
            }
        }
    },

    checkWebAuthnSupport: function() {
        if (window.PublicKeyCredential === undefined ||
            typeof window.PublicKeyCredential !== "function") {
            return true;
        }
        else{
            return true;
        }
    }
};

window.HYPRFido2Client = HYPRFido2Client;