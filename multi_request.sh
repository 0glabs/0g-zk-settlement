#!/bin/bash
echo "****GENERATING MULTI PROOF****"
start=`date +%s`
python3 curl.py input.json out1.json http://localhost:8080/solidity-calldata
# python3 curl.py input.json out2.json http://localhost:8080/solidity-calldata
# python3 curl.py input.json out3.json http://localhost:8080/solidity-calldata
# python3 curl.py input.json out4.json http://localhost:8080/solidity-calldata
# python3 curl.py input.json out5.json http://localhost:8080/solidity-calldata
end=`date +%s`
echo "DONE ($((end-start))s)"