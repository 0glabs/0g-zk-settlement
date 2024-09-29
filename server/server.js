const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');
const prover = require('./prover');
const { sign, genProofInput, genKeyPair, verifySig } = require('./signer');
const utils = require('./helper/utils');
const { callRustFunction } = require('./wrapper');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/sign-keypair', async (req, res) => {
    try {
        const { packPrivkey0, packPrivkey1, packedPubkey0, packedPubkey1 } = await genKeyPair();
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

app.post('/proof-input', async (req, res) => {
    try {
        const result = await genProofInput(req.body);
        const responseBody = {
            serializedRequest: result.serializedRequest,
            signer: result.signer,
            r8: result.r8,
            s: result.s
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(utils.jsonifyData(responseBody, true));
    } catch (error) {
        console.error('Error generating proof input:', error);
        res.status(500).json({ error: error.message });
    }
});

async function generateProof(inputs, useRust = false) {
    if (useRust) {
        const inputStr = JSON.stringify(inputs);
        const result = await callRustFunction('generate_proof', inputStr);
        return JSON.parse(result);
    } else {
        // JavaScript implementation
        return await prover.generateProof(inputs);
    }
}

app.post('/proof', async (req, res) => {
    console.log('Proof generation started');
    try {
        const inputs = Object.keys(req.body).length > 0 ? req.body : null;
        const useRust = req.query.backend === 'rust'; // Use query parameter to choose backend
        console.log(`Proof is generated using ${useRust ? 'Rust' : 'JavaScript'} backend`);
        const { proof, publicSignals } = await generateProof(inputs, useRust);
        console.log('Proof generation completed');
        res.json({
            proof,
            publicSignals
        });
    } catch (error) {
        handleError(res, error);
    }
});

app.post('/proof-combined', async (req, res) => {
    console.log('Generating proof from orignal request data');
    try {
        // Step 1: Generate proof input
        const proofInput = await genProofInput(req.body);
        // Step 2: Generate Solidity calldata
        const useRust = req.query.backend === 'rust'; // Use query parameter to choose backend
        const { proof, publicSignals } =  await generateProof(JSON.parse(utils.jsonifyData(proofInput, true)), useRust);
        console.log('Proof generation completed');
        res.json({
            proof,
            publicSignals
        });
    } catch (error) {
        handleError(res, error);
    }
});

async function generateCalldata(inputs, useRust = false) {
    if (useRust) {
        const inputStr = JSON.stringify(inputs);
        const result = await callRustFunction('generate_calldata', inputStr);
        return JSON.parse(result);
    } else {
        // JavaScript implementation
        return await prover.getSolidityCalldata(inputs);
    }
}

app.post('/solidity-calldata', async (req, res) => {
    console.log('Generating Solidity calldata');
    try {
        const inputs = Object.keys(req.body).length > 0 ? req.body : null;
        const useRust = req.query.backend === 'rust'; // Use query parameter to choose backend
        const calldata = await generateCalldata(inputs, useRust);
        res.setHeader('Content-Type', 'application/json');
        res.send(calldata);
        console.log(`Solidity calldata is generated using ${useRust ? 'Rust' : 'JavaScript'} backend`);
    } catch (error) {
        handleError(res, error);
    }
});

app.post('/solidity-calldata-combined', async (req, res) => {
    console.log('Generating solidity calldata from orignal request data');
    try {
        // Step 1: Generate proof input
        const proofInput = await genProofInput(req.body);
        // Step 2: Generate Solidity calldata
        const useRust = req.query.backend === 'rust'; // Use query parameter to choose backend
        const calldata = await generateCalldata(JSON.parse(utils.jsonifyData(proofInput, true)), useRust);
        res.setHeader('Content-Type', 'application/json');
        res.send(calldata);
        console.log(`Solidity calldata generated using ${useRust ? 'Rust' : 'JavaScript'} backend`);
    } catch (error) {
        handleError(res, error);
    }
});

app.get('/vkey', async (req, res) => {
    try {
        const vKey = await prover.getVerificationKey();
        res.json(vKey);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/verifier-contract', async (req, res) => {
    console.log('Generating verifier contract');
    try {
        const verifierCode = await prover.getVerifierContract();
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
        const verifierCode = await prover.getVerifierContract(true);
        res.setHeader('Content-Type', 'text/plain');
        res.send(verifierCode);
        console.log('Verifier contract is generated');
    } catch (error) {
        handleError(res, error);
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

async function startServer() {
    try {
        process.env.RUST_LOG = 'info';
        console.log('Initializing server...');

        const port = process.env.JS_PROVER_PORT || 3000;
        const useHttps = process.env.USE_HTTPS === 'true';

        if (useHttps) {
            const keyPath = process.env.SSL_KEY_PATH;
            const certPath = process.env.SSL_CERT_PATH;

            if (!keyPath || !certPath) {
                throw new Error('SSL key and certificate paths must be provided when using HTTPS.');
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
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();