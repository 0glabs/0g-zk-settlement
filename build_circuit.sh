#!/bin/bash

function install_circom() {
    # check if circom is installed
    if [ ! -x "$(command -v circom)" ]; then
        # if not , to install.
        echo "circom unavailable, installing..."
        cargo install --git https://github.com/iden3/circom.git --rev 2eaaa6d --bin circom
        if [ $? -ne 0 ]; then
            echo "failed to install circom, please install it manually and try again"
            exit 1
        fi
        echo "installed circom successfully"
    else
        # if installed, output the current circom version
        echo "circom is installed, current version:"
        circom --version
    fi
}

function build_circuit() {
    # get input .circom file and output path
    input_file="$1"
    output_dir="$2"

    mkdir -p $output_dir

    # check whether the input .circom file exists
    if [ ! -f "$input_file" ]; then
        echo "entered .circom file does not exist, please check the path and try again"
        exit 1
    fi

    # get current dir
    current_dir=$(pwd)
    circomlib_path="$current_dir/node_modules/circomlib/circuits"

    echo "$circomlib_path"

    # compile .circom file to get r1cs file
    circom "$input_file" --r1cs --wasm --output "$output_dir" 

    if [ $? -eq 0 ]; then
        echo "r1cs file is generated successfully and the output directory is: $output_dir"
    else
        echo "r1cs file generation failed, please check the .circom file and try again"
        exit 1
    fi
}

dir_path=$(dirname "$0")

cd "$dir_path" || exit

if [[ $1 -eq "--install" ]]; then
    install_circom
elif [ ! -x "$(command -v circom)" ]; then
    install_circom
    build_circuit "./circuits/settle_request.circom" output
else
    build_circuit "./circuits/settle_request.circom" output
fi
