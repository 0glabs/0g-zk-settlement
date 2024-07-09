const snarkjs = require('snarkjs');
const fs = require('fs').promises;
const readline = require('readline');
const config = require('./config');

function formatTime(seconds) {
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

async function runTrustedSetup() {
    console.log('Starting trusted setup...');

    async function measureTime(operation) {
        const start = Date.now();
        await operation();
        const end = Date.now();
        const duration = Math.floor((end - start) / 1000);
        console.log(`DONE (${formatTime(duration)})`);
    }

    try {
        console.log('****GENERATE ZKEY 0****');
        await measureTime(async () => {
            await snarkjs.zKey.newZKey(
                `${config.buildDir}/${config.circuitName}.r1cs`,
                config.ptauPath,
                `${config.buildDir}/${config.circuitName}_0.zkey`
            );
        });

        console.log('****CONTRIBUTE TO THE PHASE 2 CEREMONY****');
        await measureTime(async () => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            const userInput = await new Promise(resolve => rl.question("Enter some random text: ", resolve));
            rl.close();

            await snarkjs.zKey.contribute(
                `${config.buildDir}/${config.circuitName}_0.zkey`,
                `${config.buildDir}/${config.circuitName}_1.zkey`,
                "1st Contributor Name",
                userInput
            );
        });

        console.log('****GENERATING FINAL ZKEY****');
        await measureTime(async () => {
            await snarkjs.zKey.beacon(
                `${config.buildDir}/${config.circuitName}_1.zkey`,
                `${config.buildDir}/${config.circuitName}.zkey`,
                "Final Beacon phase2",
                "0102030405060708090a0b0c0d0e0f101112231415161718221a1b1c1d1e1f",
                10
            );
        });

        console.log('****VERIFYING FINAL ZKEY****');
        await measureTime(async () => {
            const verified = await snarkjs.zKey.verifyFromR1cs(
                `${config.buildDir}/${config.circuitName}.r1cs`,
                config.ptauPath,
                `${config.buildDir}/${config.circuitName}.zkey`
            );
            if (!verified) {
                throw new Error("zkey verification failed");
            }
            console.log("zkey verification successful!");
        });

        console.log('****EXPORTING VERIFICATION KEY****');
        await measureTime(async () => {
            const vKey = await snarkjs.zKey.exportVerificationKey(`${config.buildDir}/${config.circuitName}.zkey`);
            await fs.writeFile(`${config.buildDir}/${config.circuitName}_vkey.json`, JSON.stringify(vKey, null, 2));
        });

        console.log('Trusted setup completed successfully');
    } catch (error) {
        console.error('Error during setup:', error);
        throw error;
    }
}

module.exports = { runTrustedSetup };