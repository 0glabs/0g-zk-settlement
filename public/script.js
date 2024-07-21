document.addEventListener('DOMContentLoaded', function () {
    const getVkeyButton = document.getElementById('getVkey');
    const proveButton = document.getElementById('prove');
    const getVerifierContractButton = document.getElementById('getVerifierContract');
    const getSolidityCalldataButton = document.getElementById('getSolidityCalldata');
    const resultDiv = document.getElementById('result');
    const proofInput = document.getElementById('proofInput');

    getVkeyButton.addEventListener('click', async function () {
        try {
            resultDiv.innerHTML = '<p>Fetching verification key...</p>';
            const response = await fetch('http://localhost:3000/vkey');
            const data = await response.json();
            resultDiv.innerHTML = '<h3>Verification Key:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } catch (error) {
            resultDiv.innerHTML = '<h3>Error:</h3><p>' + error.message + '</p>';
        }
    });

    proveButton.addEventListener('click', async function () {
        try {
            let inputData = null;
            if (proofInput.value.trim() !== '') {
                inputData = JSON.parse(proofInput.value);
            }
            resultDiv.innerHTML = '<p>Generating proof... This may take a while.</p>';

            const response = await fetch('http://localhost:3000/proof', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: inputData ? JSON.stringify(inputData) : '{}'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'An error occurred');
            }
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const decodedChunk = decoder.decode(value, { stream: true });
                const messages = decodedChunk.split('\n').filter(msg => msg.trim() !== '');

                for (const message of messages) {
                    const data = JSON.parse(message);
                    resultDiv.innerHTML = '<h3>Proof Result:</h3><pre>' + JSON.stringify(data.proof, null, 2) + '</pre>';
                    resultDiv.innerHTML += '<h3>Public Signals:</h3><pre>' + JSON.stringify(data.publicSignals, null, 2) + '</pre>';
                }
            }
        } catch (error) {
            console.error("Error:", error);
            resultDiv.innerHTML = '<h3>Error:</h3><p>' + error.message + '</p>';
        }
    });

    getVerifierContractButton.addEventListener('click', async function () {
        try {
            resultDiv.innerHTML = '<p>Generating verifier contract... This may take a while.</p>';
            const response = await fetch('http://localhost:3000/verifier-contract');
            const verifierCode = await response.text();
            resultDiv.innerHTML = '<h3>Verifier Contract:</h3><pre>' + verifierCode + '</pre>';
        } catch (error) {
            resultDiv.innerHTML = '<h3>Error:</h3><p>' + error.message + '</p>';
        }
    });

    getSolidityCalldataButton.addEventListener('click', async function () {
        try {
            let inputData = null;
            const inputValue = proofInput.value.trim();
            if (inputValue !== '') {
                try {
                    inputData = JSON.parse(inputValue);
                } catch (parseError) {
                    throw new Error('Invalid JSON input: ' + parseError.message);
                }
            }

            resultDiv.innerHTML = '<p>Generating or retrieving Solidity calldata... This may take a while.</p>';

            const response = await fetch('http://localhost:3000/solidity-calldata', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputData || {})
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }

            const data = await response.text();
            resultDiv.innerHTML = '<h3>Solidity Calldata:</h3><pre>' + data + '</pre>';
        } catch (error) {
            console.error("Error:", error);
            resultDiv.innerHTML = '<h3>Error:</h3><p>' + error.message + '</p>';
        }
    });
});