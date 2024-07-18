const express = require('express');
const path = require('path');
const cors = require('cors');
const { generateProof, getSolidityCalldata, getVerificationKey, getVerifierContract } = require('./prover');
const config = require('./config');

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

app.post('/prove', async (req, res) => {
    console.log('Proof generation started');
    try {
        const inputs = Object.keys(req.body).length > 0 ? req.body : null;
        const { proof, publicSignals } = await generateProof(inputs);
        console.log('Proof generation completed');
        res.json({ 
            status: 'Completed',
            proof: proof,
            publicSignals: publicSignals
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            status: 'Error', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.get('/verifier-contract', async (req, res) => {
    console.log('Generating verifier contract');
    try {
        const verifierCode = await getVerifierContract();
        res.setHeader('Content-Type', 'text/plain');
        res.send(verifierCode);
    } catch (error) {
        console.error('Error generating verifier contract:', error);
        res.status(500).json({ error: error.message });
    }
    console.log('Verifier contract is generated');
});

app.post('/solidity-calldata', async (req, res) => {
    console.log('Generating Solidity calldata');
    try {
        const inputs = Object.keys(req.body).length > 0 ? req.body : null;
        const calldata = await getSolidityCalldata(inputs);
        res.json({ 
            status: 'Completed',
            calldata: calldata
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            status: 'Error', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zk-settlement agent running on http://0.0.0.0:${PORT}`);
});