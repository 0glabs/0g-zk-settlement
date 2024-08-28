# zkSettlement
> 0G serving network adopts a free marketplace where users and service providers decide the prices of the services through a peer-to-peer fashion. The service provider is free to quote their services, and then users are free to choose the services that are priced appropriately for them to use.
> The service provider can decide at any point to send the request traces with user’s signature to the smart contract for settlement. Once settlement is done, the corresponding portion of the pre-charged fee can be sent to service provider’s account. 

Users and service providers conduct off-chain service transactions, and service providers can consume the _request traces_ generated from each service transaction to settle service fees on-chain and update user balances.
![image.png](./doc/images/‎0G%20zkSettlement.‎001.png)

# Why zk？
As shown in the figure above, on-chain nodes need to execute all complete state transition processes sequentially, which is often costly. With the introduction of zk:

1. Multiple state transition processing can be batched into one init to final state transition.
2. On-chain nodes only need to execute the proof verification process, which is often relatively cheap.![image.png](./doc/images/‎0G%20zkSettlement.‎002.png)

For more details on the design and implementation, please see our [Design Documentation](./doc/DESIGN.md).

# Dependence
### Linux
node-v20.5.0
### mac
node-v20.15.1

Note: The above version is the version that has passed the verification, and is not the only or minimum version.
# Quick
## JS backend
### Compile circuit
```shell
yarn compile
```
### Trust setup
```shell
yarn setup
```

## Build rust backend
We also provide a more efficient implementation for costy generating proof and calldata operations using Rust language. 
### build
```shell
cd rust_backend
cargo build --release
# A example on Mac OS, the surfix of library on different OS may be different.
cp target/release/librust_prover.dylib ../build/
```

### Start service
```shell
yarn start
```

## Access with CURL
You can also use the zkSettlement prover agent's functionalities by directly calling the API.
For detailed API documentation and usage examples, please refer to our [API Documentation](./doc/API.md).

# Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

# License
MIT License