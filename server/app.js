const express = require('express')
const fs = require("fs");
const fetch = require("node-fetch");
const { Console } = require('console');

const app = express()
const router = express.Router();
const contextPath = '/nodesample';
const port = 3000

const config = JSON.parse(fs.readFileSync("./hyprconfig.json"));
if (!config.accessToken || !config.url) {
    console.error("Missing configuration in hyprconfig.json.");
    return;
}



app.use(express.json());

app.use('/dist', express.static('./dist'))
app.use('/public', express.static('./public'))
router.use('/dist', express.static('./dist'))
router.use('/public', express.static('./public'))


app.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`));
router.get('/', (req, res) => res.sendFile(`${__dirname}/index.html`));

const attestationOptions = async (req, res) => {
    let response;
    try {
        response = await fetch(`${config.url}/rp/api/versioned/fido2/attestation/options`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": config.accessToken
            },
            method: "POST",
            body: JSON.stringify(req.body)
        });
        
        const body = await response.json();
        if (body.errorText || body.error) {
            throw new Error(body.errorText || body.error);
        };

        res.send(body).end();

    } catch (err) {
        res.status(400).send({errorText: err.toString()});
    }
}
app.post('/attestation/options', attestationOptions);
router.post('/attestation/options', attestationOptions);

const attestationResult = async (req, res) => {
    let response;

    try {
        response = await fetch(`${config.url}/rp/api/versioned/fido2/attestation/result`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": config.accessToken
            },
            method: "POST",
            body: JSON.stringify(req.body)
        });
        
        const body = await response.json();
        if (body.errorText || body.error) {
            throw new Error(body.errorText || body.error);
        };

        res.send(body).end();


    } catch (err) {
        res.status(400).send({errorText: err.toString()});
    }
}

app.post('/attestation/result', attestationResult);
router.post('/attestation/result', attestationResult);

const assertionOptions = async (req, res) => {
    let response;

    try {
        response = await fetch(`${config.url}/rp/api/versioned/fido2/assertion/options`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": config.accessToken
            },
            method: "POST",
            body: JSON.stringify(req.body)
        });
        
        const body = await response.json();
        if (body.errorText || body.error) {
            throw new Error(body.errorText || body.error);
        };

        res.send(body).end();


    } catch (err) {
        res.status(400).send({errorText: err.toString()});
    }
}

app.post('/assertion/options', assertionOptions);
router.post('/assertion/options', assertionOptions);

const assertionResult = async (req, res) => {
    let response;

    try {
        response = await fetch(`${config.url}/rp/api/versioned/fido2/assertion/result`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": config.accessToken
            },
            method: "POST",
            body: JSON.stringify(req.body)
        });
        
        const body = await response.json();
        if (body.errorText || body.error) {
            throw new Error(body.errorText || body.error);
        };

        res.send(body).end();


    } catch (err) {
        res.status(400).send({errorText: err.toString()});
    }
}

app.post('/assertion/result', assertionResult);
router.post('/assertion/result', assertionResult);

app.use(contextPath, router);
app.listen(port, () => console.log(`HYPR demo app listening at http://localhost:${port}`))