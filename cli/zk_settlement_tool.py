import argparse
import requests
import json
import sys
import os

# 从环境变量获取端口，如果没有设置则使用默认值
NODE_PORT = os.environ.get('JS_PROVER_PORT', '3000')
RUST_PORT = os.environ.get('RUST_PROVER_PORT', '3001')

BASE_URL = f"http://localhost:{NODE_PORT}"
RUST_URL = f"http://localhost:{RUST_PORT}"

def read_json_file(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

def key_pair():
    response = requests.get(f"{BASE_URL}/sign-keypair")
    print(json.dumps(response.json(), indent=2))

def signature(data):
    response = requests.post(f"{BASE_URL}/signature", json=data)
    print(json.dumps(response.json(), indent=2))

def check_sign(data):
    response = requests.post(f"{BASE_URL}/check-sign", json=data)
    print(json.dumps(response.json(), indent=2))

def generate_calldata(data, backend):
    # 首先获取proof-input
    proof_input_response = requests.post(f"{BASE_URL}/proof-input", json=data)
    proof_input = proof_input_response.json()
    if backend == 'rust':
        # 使用Rust后端
        calldata_response = requests.post(f"{RUST_URL}/solidity-calldata", json=proof_input)
    else:  # 默认使用JS后端        
        # 最后生成calldata
        calldata_response = requests.post(f"{BASE_URL}/solidity-calldata", json=proof_input)
    
    print(calldata_response.text)

def export_verifier():
    response = requests.get(f"{BASE_URL}/verifier-contract")
    print(response.text)

def export_batch_verifier():
    response = requests.get(f"{BASE_URL}/batch-verifier-contract")
    print(response.text)

def main():
    parser = argparse.ArgumentParser(description="ZK-Settlement CLI Tool")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    subparsers.add_parser("key-pair", help="Generate a new Ed25519 key pair")
    
    signature_parser = subparsers.add_parser("signature", help="Generate signatures for the provided data")
    signature_parser.add_argument("data", nargs="?", help="JSON data for signature generation")
    signature_parser.add_argument("-f", "--file", help="JSON file containing input data")
    
    check_sign_parser = subparsers.add_parser("check-sign", help="Check if signatures are valid")
    check_sign_parser.add_argument("data", nargs="?", help="JSON data for signature checking")
    check_sign_parser.add_argument("-f", "--file", help="JSON file containing input data")
    
    generate_calldata_parser = subparsers.add_parser("solidity-calldata", help="Generate Solidity calldata")
    generate_calldata_parser.add_argument("data", nargs="?", help="JSON data for calldata generation")
    generate_calldata_parser.add_argument("-f", "--file", help="JSON file containing input data")
    generate_calldata_parser.add_argument("-r", "--rust", action="store_true", help="Use Rust backend")
    generate_calldata_parser.add_argument("-j", "--js", action="store_true", help="Use JavaScript backend")
    
    subparsers.add_parser("export-verifier", help="Export the verifier contract")
    subparsers.add_parser("export-batch-verifier", help="Export the batch verifier contract")

    args = parser.parse_args()

    if args.command == "key-pair":
        key_pair()
    elif args.command in ["signature", "check-sign", "solidity-calldata"]:
        if args.file:
            data = read_json_file(args.file)
        elif args.data:
            data = json.loads(args.data)
        else:
            print("Error: Please provide either JSON data or a JSON file.")
            sys.exit(1)

        if args.command == "signature":
            signature(data)
        elif args.command == "check-sign":
            check_sign(data)
        elif args.command == "solidity-calldata":
            backend = 'rust' if args.rust else 'js'
            generate_calldata(data, backend)
    elif args.command == "export-verifier":
        export_verifier()
    elif args.command == "export-batch-verifier":
        export_batch_verifier()
    else:
        parser.print_help()

if __name__ == "__main__":
    main()