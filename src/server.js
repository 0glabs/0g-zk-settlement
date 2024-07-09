const express = require('express');
const path = require('path');
const cors = require('cors');
const { generateProof, getVerificationKey } = require('./prover');
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
    try {
        const { proof, publicSignals } = await generateProof(req.body);
        res.json({ proof, publicSignals });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`zk-settlement prover agent running on port ${PORT}`);
});