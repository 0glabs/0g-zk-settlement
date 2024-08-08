# zkSettlement CLI Tool

## Overview

The zkSettlement CLI tool is a command-line interface for interacting with the zkSettlement agent. It provides various functionalities including key pair generation, signature creation and verification, calldata generation, and contract export.

## Installation

Ensure you have Python 3.x installed on your system. Then, install the required dependencies:

```bash
pip install requests
```

## Usage
The general syntax for using the CLI tool is:
```bash
python zk_settlement_cli.py <command> [options]
```

## Environment Variables

NODE_PORT: Port for the NodeJS backend (default: 3000)
RUST_PORT: Port for the Rust backend (default: 8080)

### Commands
#### Generate Key Pair
Generate a new Ed25519 key pair.
```bash
python zk_settlement_cli.py key-pair
```

#### Generate Signature
Generate signatures for the provided data.
```bash
python zk_settlement_cli.py signature <JSON_DATA>
python zk_settlement_cli.py signature -f <JSON_FILE>
```

#### Check Signature
Verify if the provided signatures are valid.
```bash
python zk_settlement_cli.py check-sign <JSON_DATA>
python zk_settlement_cli.py check-sign -f <JSON_FILE>
```

#### Generate Calldata
Generate Solidity calldata based on the provided input.
```bash
python zk_settlement_cli.py solidity-calldata <JSON_DATA>
python zk_settlement_cli.py solidity-calldata -f <JSON_FILE>
```

#### Export Verifier Contract
Export the verifier contract.
```bash
python zk_settlement_cli.py export-verifier
```

#### Export Batch Verifier Contract
Export the batch verifier contract.
```bash
python zk_settlement_cli.py export-batch-verifier
```

### Options
- -f, --file: Specify a JSON file as input instead of providing JSON data directly in the command line.
- -r, --rust: Use the Rust backend (only for solidity-calldata command).
- -j, --js: Use the JavaScript backend (only for solidity-calldata command, default).

## Note
Ensure that the zkSettlement agent (both NodeJS and Rust backends) is running and accessible at the specified ports before using this CLI tool.