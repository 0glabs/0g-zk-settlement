const { runTrustedSetup } = require('../src/setup.js');

runTrustedSetup()
    .then(() => console.log('Trusted setup completed successfully'))
    .catch(console.error);

setInterval(() => {}, 1000);