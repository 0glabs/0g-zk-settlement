const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');
const {
    generateProof,
    getSolidityCalldata,
    getVerificationKey,
    getVerifierContract
} = require('./prover');
const { sign, genProofInput, genKeyPair, verifySig } = require('./signer');
const utils = require('./helper/utils');
const { generateKeyPair } = require('crypto');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/vkey', async (req, res) => {
    try {
        const vKey = await getVerificationKey();
        res.json(vKey);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/proof', async (req, res) => {
    console.log('Proof generation started');
    try {
        const inputs = Object.keys(req.body).length > 0 ? req.body : null;
        const { proof, publicSignals } = await generateProof(inputs);
        console.log('Proof generation completed');
        res.json({
            proof,
            publicSignals
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.get('/verifier-contract', async (req, res) => {
    console.log('Generating verifier contract');
    try {
        const verifierCode = await getVerifierContract();
        res.setHeader('Content-Type', 'text/plain');
        res.send(verifierCode);
        console.log('Verifier contract is generated');
    } catch (error) {
        handleError(res, error);
    }
});

app.get('/batch-verifier-contract', async (req, res) => {
    console.log('Generating verifier contract');
    try {
        const verifierCode = await getVerifierContract(true);
        res.setHeader('Content-Type', 'text/plain');
        res.send(verifierCode);
        console.log('Verifier contract is generated');
    } catch (error) {
        handleError(res, error);
    }
});

app.post('/solidity-calldata', async (req, res) => {
    console.log('Generating Solidity calldata');
    try {
        const inputs = Object.keys(req.body).length > 0 ? req.body : null;
        const calldata = await getSolidityCalldata(inputs);
        res.setHeader('Content-Type', 'application/json');
        res.send(calldata);
        console.log('Solidity calldata is generated');
    } catch (error) {
        handleError(res, error);
    }
});

app.post('/signature', async (req, res) => {
    try {
        const signatures = await sign(req.body);
        const responseBody = {
            signatures: signatures
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(utils.jsonifyData(responseBody));
    } catch (error) {
        console.error('Error in /sign route:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/proof-input', async (req, res) => {
    try {
        const result = await genProofInput(req.body);
        const responseBody = {
            serializedRequest: result.serializedRequest,
            signer: result.signer,
            r8: result.r8,
            s: result.s,
            serializedAccount: result.serializedAccount
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(utils.jsonifyData(responseBody, true));
    } catch (error) {
        console.error('Error generating proof input:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/sign-keypair', async (req, res) => {
    try {
        const {packPrivkey0, packPrivkey1, packedPubkey0, packedPubkey1} = await genKeyPair();
        const responseBody = {
            privkey: ["0x" + packPrivkey0.toString(16), "0x" + packPrivkey1.toString(16)],
            pubkey: ["0x" + packedPubkey0.toString(16), "0x" + packedPubkey1.toString(16)],
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(utils.jsonifyData(responseBody));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/check-sign', async (req, res) => {
    try {
        const isValid = await verifySig(req.body);
        res.setHeader('Content-Type', 'application/json');
        res.send(isValid);
    } catch (error) {
        console.error('Error in /sign route:', error);
        res.status(500).json({ error: error.message });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

function handleError(res, error) {
    console.error('Error:', error);
    res.status(500).json({
        status: 'Error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
}

const port = process.env.JS_PROVER_PORT || 3000;
const useHttps = process.env.USE_HTTPS === 'true';

if (useHttps) {
    const keyPath = process.env.SSL_KEY_PATH;
    const certPath = process.env.SSL_CERT_PATH;

    if (!keyPath || !certPath) {
        console.error('SSL key and certificate paths must be provided when using HTTPS.');
        process.exit(1);
    }

    const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };

    https.createServer(httpsOptions, app).listen(port, '0.0.0.0', () => {
        console.log(`Zk-settlement agent running on https://0.0.0.0:${port}`);
    });
} else {
    http.createServer(app).listen(port, '0.0.0.0', () => {
        console.log(`Zk-settlement agent running on http://0.0.0.0:${port}`);
    });
}