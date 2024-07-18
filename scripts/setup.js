const { runTrustedSetup } = require('../src/setup.js');

runTrustedSetup()
  .then(() => {
    console.log('Trusted setup completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });