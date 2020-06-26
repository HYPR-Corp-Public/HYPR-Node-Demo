import React from "react";

const buttonStyle = {
    color: "#fff",
    backgroundColor: "#1DCAD4",
    border: "1px solid #92EBF0",
    padding: "10px",
    borderRadius: "3px",
};

const disabledButtonStyle = {
    color: "#fff",
    backgroundColor: "grey",
    border: "1px solid #92EBF0",
    padding: "10px",
    borderRadius: "3px",
    opacity: "50%"
};

function isFido2Available() {
    return new Promise((resolve, reject) => {
        HYPRFido2Client.isFido2Available((error, result) => {
            error ? reject(error) : resolve(result);
        })
    })
}

async function createAttestationOptions(username, displayName) {
    const attestationOptions = HYPRFido2Client.createAttestationOptions(username, displayName);

    try {
        const response = await fetch("/attestation/options", {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(attestationOptions)
        })

        const body = await response.json();
        if (response.status !== 200) {
            throw new Error(body.errorText);
        }

        return body;
    } catch(err) {
        throw err;
    }
}

async function createAssertionOptions(username) {
    const assertionOptions = HYPRFido2Client.createAssertionOptions(username);

    try {
        const response = await fetch("/assertion/options", {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(assertionOptions)
        })

        const body = await response.json();
        if (response.status !== 200) {
            throw new Error(body.errorText);
        }

        return body;
    } catch(err) {
        throw err;
    }
}



async function verifyCredentialResult(credential) {
    try {
        const response = await fetch("/attestation/result", {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(credential)
        })

        const body = await response.json();
        if (response.status !== 200) {
            throw new Error(body.errorText);
        }

        return body;
    } catch(err) {
        throw err;
    }
}


async function verifyAssertionResult(credential) {
    try {
        const response = await fetch("/assertion/result", {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(credential)
        })

        const body = await response.json();
        if (response.status !== 200) {
            throw new Error(body.errorText);
        }

        return body;
    } catch(err) {
        throw err;
    }
}

async function createCredential(attestationOptions) {
    return new Promise((resolve, reject) => {
        HYPRFido2Client.createFido2Credential(attestationOptions, (error, result) => {
            error ? reject(error) : resolve(result);
        });
    })
}

async function createAssertion(assertionOptions) {
    return new Promise((resolve, reject) => {
        HYPRFido2Client.useFido2Credential(assertionOptions, (error, result) => {
            error ? reject(error) : resolve(result);
        });
    })
}

export default function InputForm() {
    const [username, setUsername] = React.useState("")
    const [error, setError] = React.useState("")
    const [success, setSuccess] = React.useState("")


    const registerCallback = React.useCallback(async (event) => {
        setError("");
        setSuccess("")
        event.preventDefault();
        try {
            isFido2Available();
        } catch (err) {
            setError(`FIDO2 unavailable on this browser/device. ${err.toString()}`);
        }
        
        let attestationOptions;
        try {
            attestationOptions = await createAttestationOptions(username, "TestUser")
        } catch (err) {
            setError(err.toString());
            return;
        }

        let credential;
        try {
            credential = await createCredential(attestationOptions)
        } catch (err) {
            setError(`Could not create credential. ${err.toString()}`);
            return;
        };

        try {
            const result = await verifyCredentialResult(credential);
            setSuccess(`Successfully created credential for user ${result.username}! You may now authenticate.`);
        } catch (err) {
            setError(`Could not verify credential. ${err.toString()}`)
        }
    });

    const authCallback = React.useCallback(async (event) => {
        setError("");
        setSuccess("");
        event.preventDefault();
        
        try {
            isFido2Available();
        } catch (err) {
            setError(`FIDO2 unavailable on this browser/device. ${err.toString()}`);
        }

        let assertionOptions;
        try {
            assertionOptions = await createAssertionOptions(username);
        } catch (err) {
            setError(err.toString());
            return;
        }

        let assertion;
        try {
            assertion = await createAssertion(assertionOptions);
        } catch (err) {
            setError(err.toString());
            return;
        }

        try {
            const result = await verifyAssertionResult(assertion);
            setSuccess(`Successfully authenticated user ${result.username}!`);
        } catch (err) {
            setError(err.toString());
            return;
        }

    });


    return (
        <form>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <div className="row">
                <div className="col-md-4">
                    <label htmlFor="username">Enter your username:</label>                
                </div>
            </div>
            <div className="row">
                <div className="col-md-4">
                    <input autoComplete={"off"} className="form-control" id="username" type="text" onChange={(e) => setUsername(e.target.value)}></input>
                </div>
            </div>
            <div className="row my-3">
                <style>
                    button:after {

                    }
                </style>
                <div className="col-md-6">
                    <button className="mr-3" style={username ? buttonStyle: disabledButtonStyle} disabled={!username} onClick={registerCallback}>Register</button>
                    <button style={username ? buttonStyle: disabledButtonStyle} onClick={authCallback}>Authenticate</button>
                </div>
            </div>
        </form>
    );
}