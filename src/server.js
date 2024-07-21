const express = require('express');
const path = require('path');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const readline = require('readline');
const {
    generateProof,
    getSolidityCalldata,
    getVerificationKey,
    getVerifierContract
} = require('./prover');
const { sign, genProofInput, genKeyPair } = require('./signer');
const utils = require('../helper/utils');
const { generateKeyPair } = require('crypto');

const app = express();

app.use(cors());
app.use(express.json());
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
        const result = await sign(req.body);
        const responseBody = {
            signer: result.packPubkey,
            signatures: {
                R8: result.r8,
                S: result.s
            }
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
        const {privkey, pubkey} = await genKeyPair();
        const responseBody = {
            privkey: privkey,
            pubkey: pubkey,
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(utils.jsonifyData(responseBody));
    } catch (error) {
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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the port number: ', (port) => {
    rl.question('Use HTTPS? (y/n): ', (useHttps) => {
        if (useHttps.toLowerCase() === 'y') {
            rl.question('Enter path to SSL key: ', (keyPath) => {
                rl.question('Enter path to SSL certificate: ', (certPath) => {
                    const httpsOptions = {
                        key: fs.readFileSync(keyPath),
                        cert: fs.readFileSync(certPath)
                    };
                    https.createServer(httpsOptions, app).listen(port, '0.0.0.0', () => {
                        console.log(`Zk-settlement agent running on https://0.0.0.0:${port}`);
                    });
                    rl.close();
                });
            });
        } else {
            app.listen(port, '0.0.0.0', () => {
                console.log(`Zk-settlement agent running on http://0.0.0.0:${port}`);
            });
            rl.close();
        }
    });
});