document.addEventListener('DOMContentLoaded', function() {
    const getVkeyButton = document.getElementById('getVkey');
    const proveButton = document.getElementById('prove');
    const resultDiv = document.getElementById('result');
    const proofInput = document.getElementById('proofInput');

    getVkeyButton.addEventListener('click', async function() {
        try {
            const response = await fetch('http://localhost:3000/vkey');
            const data = await response.json();
            resultDiv.innerHTML = '<h3>Verification Key:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } catch (error) {
            resultDiv.innerHTML = '<h3>Error:</h3><p>' + error.message + '</p>';
        }
    });

    proveButton.addEventListener('click', async function() {
        try {
            const inputData = JSON.parse(proofInput.value);
            const response = await fetch('http://localhost:3000/prove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputData)
            });
            const data = await response.json();
            resultDiv.innerHTML = '<h3>Proof Result:</h3><pre>' + JSON.stringify(data, null, 2) + '</pre>';
        } catch (error) {
            resultDiv.innerHTML = '<h3>Error:</h3><p>' + error.message + '</p>';
        }
    });
});