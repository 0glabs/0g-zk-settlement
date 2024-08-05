# zkSettlement Agent API

This document outlines the API endpoints for the ZK-Settlement agent.

## Base URL

The base URL depends on the server configuration:

- HTTP: `http://0.0.0.0:<port>`
- HTTPS: `https://0.0.0.0:<port>`

Where `<port>` is the port number specified when starting the server.

## Endpoints

### 1. Generate Key Pair

Generates a new Ed25519 key pair.

- **URL:** `/sign-keypair`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "publicKey": [Signer private key],
      "privateKey": [Signer public key],
    }
    ```
**Example:**
```bash
curl http://localhost:3000/sign-keypair
```
```ouput
{"privkey":[115,207,153,233,130,53,126,224,210,141,150,42,168,70,164,94,49,94,236,143,159,216,173,159,196,220,158,41,61,148,167,28],"pubkey":[[217,103,123,135,208,96,62,180,218,54,233,228,161,242,2,99,10,91,87,163,149,168,253,18,253,137,178,144,179,183,112,22],[247,223,117,192,119,101,154,99,194,33,177,107,36,33,128,48,105,113,62,116,60,164,194,57,159,29,232,145,44,224,1,15]]}
```

### 2. Generate Signature

Generates signatures for the provided data.

- **URL:** `/signature`
- **Method:** `POST`
- **Data Params:** JSON object containing data to be signed
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "signer": [Signer public key],
      "signatures": [packed signatures]
    }
    ```
- **Example:** 
```bash
curl -X POST -H "Content-Type: application/json" -d '{"requests":[{"nonce":1,"inputCount":1,"outputCount":0,"price":"10","updatedAt":"2024-01-01T00:00:00Z","createdAt":"2024-01-02T00:00:00Z","serviceName":"0x1234567890abcdef1234567890abcdef","userAddress":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","providerAddress":"0x1234567890123456789012345678901234567890"}],"privkey":[115,207,153,233,130,53,126,224,210,141,150,42,168,70,164,94,49,94,236,143,159,216,173,159,196,220,158,41,61,148,167,28]}' http://localhost:3000/signature
```
```ouput
{"signatures":[[205,19,95,103,208,73,246,142,13,109,241,192,166,197,235,160,114,214,217,69,187,192,27,109,175,213,110,42,39,160,238,166,206,12,213,207,38,237,218,36,221,192,167,218,238,68,247,246,46,24,168,40,124,81,75,194,255,226,190,35,248,77,203,5]]}
```

### 3. Check Signature

Check signatures if valid.

- **URL:** `/check-sign`
- **Method:** `POST`
- **Data Params:** JSON object containing data to be signed, signatures and pubkey
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```
    [bool]
    ```
- **Example:** 
```bash
curl -X POST -H "Content-Type: application/json" -d '{"requests":[{"nonce":1,"inputCount":1,"outputCount":0,"price":"10","updatedAt":"2024-01-01T00:00:00Z","createdAt":"2024-01-02T00:00:00Z","serviceName":"0x1234567890abcdef1234567890abcdef","userAddress":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","providerAddress":"0x1234567890123456789012345678901234567890"}],"pubkey":[[217,103,123,135,208,96,62,180,218,54,233,228,161,242,2,99,10,91,87,163,149,168,253,18,253,137,178,144,179,183,112,22],[247,223,117,192,119,101,154,99,194,33,177,107,36,33,128,48,105,113,62,116,60,164,194,57,159,29,232,145,44,224,1,15]],"signatures":[[205,19,95,103,208,73,246,142,13,109,241,192,166,197,235,160,114,214,217,69,187,192,27,109,175,213,110,42,39,160,238,166,206,12,213,207,38,237,218,36,221,192,167,218,238,68,247,246,46,24,168,40,124,81,75,194,255,226,190,35,248,77,203,5]]}' http://localhost:3000/check-sign
```
```output
[true]
```

### 4. Generate Proof Input

Generates input for proof generation based on the provided data.

- **URL:** `/proof-input`
- **Method:** `POST`
- **Data Params:** JSON object containing necessary data for proof input generation
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "serializedRequest": [Serialized request data],
      "r8": [R8 component of signatures],
      "s": [S component of signatures],
      "serializedAccount": [Serialized account data]
    }
    ```
- **Example:** 
```bash
curl -X POST -H "Content-Type: application/json" -d '{"requests":[{"nonce":1,"inputCount":1,"outputCount":0,"price":"10","updatedAt":"2024-01-01T00:00:00Z","createdAt":"2024-01-02T00:00:00Z","serviceName":"0x1234567890abcdef1234567890abcdef","userAddress":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","providerAddress":"0x1234567890123456789012345678901234567890"}],"account":{"balance":0,"nonce":100,"userAddress":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","providerAddress":"0x1234567890123456789012345678901234567890"},"l":4,"pubkey":[[217,103,123,135,208,96,62,180,218,54,233,228,161,242,2,99,10,91,87,163,149,168,253,18,253,137,178,144,179,183,112,22],[247,223,117,192,119,101,154,99,194,33,177,107,36,33,128,48,105,113,62,116,60,164,194,57,159,29,232,145,44,224,1,15]],"signatures":[[205,19,95,103,208,73,246,142,13,109,241,192,166,197,235,160,114,214,217,69,187,192,27,109,175,213,110,42,39,160,238,166,206,12,213,207,38,237,218,36,221,192,167,218,238,68,247,246,46,24,168,40,124,81,75,194,255,226,190,35,248,77,203,5]]}' http://localhost:3000/proof-input
```
```output
{"serializedRequest":[["1","0","0","0","1","0","0","0","0","0","0","0","10","0","0","0","0","0","0","0","0","244","81","194","140","1","0","0","0","80","120","199","140","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","172","207","106","220","0","0","0","0","180","197","218","184","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","172","207","106","220","0","0","0","0","180","197","218","184","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","172","207","106","220","0","0","0","0","180","197","218","184","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"r8":[["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"],["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"],["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"],["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"]],"s":[["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"],["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"],["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"],["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"]],"serializedAccount":["0","0","0","0","100","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]}
```


### 5. Get Verification Key

Retrieves the verification key.

- **URL:** `/vkey`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Verification key object

- **Example:** 
```bash
curl -X GET http://localhost:3000/vkey
```
```output
{"protocol":"groth16","curve":"bn128","nPublic":4,"vk_alpha_1":["20491192805390485299153009773594534940189261866228447918068658471970481763042","9383485363053290200918347156157836566562967994039712273449902621266178545958","1"],"vk_beta_2":[["6375614351688725206403948262868962793625744043794305715222011528459656738731","4252822878758300859123897981450591353533073413197771768651442665752259397132"],["10505242626370262277552901082094356697409835680220590971873171140371331206856","21847035105528745403288232691147584728191162732299865338377159692350059136679"],["1","0"]],"vk_gamma_2":[["10857046999023057135944570762232829481370756359578518086990519993285655852781","11559732032986387107991004021392285783925812861821192530917403151452391805634"],["8495653923123431417604973247489272438418190587263600148770280649306958101930","4082367875863433681332203403145435568316851327593401208105741076214120093531"],["1","0"]],"vk_delta_2":[["15215163651452012161592791490198849686900822241553895066633500590627144147933","15893598507508928981630514122816477424924626775537435683502768580816656792802"],["13952702057737622942335466937561409479025032464232227556917322374151913653951","37144773243664003271644573001925943845632569633748221010851963092507718953"],["1","0"]],"vk_alphabeta_12":[[["2029413683389138792403550203267699914886160938906632433982220835551125967885","21072700047562757817161031222997517981543347628379360635925549008442030252106"],["5940354580057074848093997050200682056184807770593307860589430076672439820312","12156638873931618554171829126792193045421052652279363021382169897324752428276"],["7898200236362823042373859371574133993780991612861777490112507062703164551277","7074218545237549455313236346927434013100842096812539264420499035217050630853"]],[["7077479683546002997211712695946002074877511277312570035766170199895071832130","10093483419865920389913245021038182291233451549023025229112148274109565435465"],["4595479056700221319381530156280926371456704509942304414423590385166031118820","19831328484489333784475432780421641293929726139240675179672856274388269393268"],["11934129596455521040620786944827826205713621633706285934057045369193958244500","8037395052364110730298837004334506829870972346962140206007064471173334027475"]]],"IC":[["11000352880506725146661685507380035706533802548284428908396799653851004456921","16461051887253598297496977652118715929466793341870087102924648618728465175552","1"],["9103425543961022054388019063335440123180704012750538145107685405360903433373","7306451228157247336491609710825895155300534266066007991517513110889642458085","1"],["15562350960492021579951510067962221854589456413886111818916844168679740805623","20923945419274409285477304728512119913855577172698742123861183181348280502380","1"],["5073366486673580787509316853947568286064869147288531382731263782547076565527","11866217021294858795335848859081190388600945793998447471387493206858420687285","1"],["21811606571933332521453633940306513134050671080940407753971725278701269013749","10000242794544356685645945537355293666958467130052441204303656703361018946925","1"]]}
```

### 6. Generate Proof

Generates a zero-knowledge proof based on the provided inputs.

- **URL:** `/proof`
- **Method:** `POST`
- **Data Params:** 
  - JSON object containing input data
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "proof": [Proof data],
      "publicSignals": [Public signals]
    }
    ```
- **Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"serializedRequest":[["1","0","0","0","1","0","0","0","0","0","0","0","10","0","0","0","0","0","0","0","0","244","81","194","140","1","0","0","0","80","120","199","140","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","172","207","106","220","0","0","0","0","180","197","218","184","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","172","207","106","220","0","0","0","0","180","197","218","184","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","172","207","106","220","0","0","0","0","180","197","218","184","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["53","148","163","184","13","22","109","122","44","168","114","59","152","103","157","242","16","61","101","195","36","79","245","58","71","193","206","223","209","250","149","157"],"r8":[["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"],["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"],["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"],["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"]],"s":[["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"],["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"],["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"],["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"]],"serializedAccount":["0","0","0","0","100","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]}' http://localhost:3000/proof
```
```output
{"proof":{"pi_a":["5621456052641123268940486201745830232857975702995854417381195721376463899356","10106749903153963788339532490876490253725331408551214039410934716861758908039","1"],"pi_b":[["2307375345781593873532853319200574915418512508674471616456978288607959622126","10042545061599731967527415736436833422235154138418676028244296260162755450737"],["17521862620554507195998828176161971857344948108841318390376272156408815402456","17175504856371240597243075339224408443627633371530569291989197538910146942969"],["1","0"]],"pi_c":["2660627277715208057983519378629103806558411785363817848456169676412225669464","7324977555923128036800040436767566691049955965807393560895737509295610901563","1"],"protocol":"groth16","curve":"bn128"},"publicSignals":["67508805047955878655522138659836237586","217179340878883550872036538015305384220","4","90"]}
```

### 7. Get Verifier Contract

Generates and returns the Solidity code for the verifier contract.

- **URL:** `/verifier-contract`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Solidity code as plain text
- **Example:** 
```bash
curl -X GET http://localhost:3000/verifier-contract
```
```solidity
// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 constant alphay  = 9383485363053290200918347156157836566562967994039712273449902621266178545958;
    uint256 constant betax1  = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 constant betax2  = 6375614351688725206403948262868962793625744043794305715222011528459656738731;
    uint256 constant betay1  = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 constant betay2  = 10505242626370262277552901082094356697409835680220590971873171140371331206856;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 15893598507508928981630514122816477424924626775537435683502768580816656792802;
    uint256 constant deltax2 = 15215163651452012161592791490198849686900822241553895066633500590627144147933;
    uint256 constant deltay1 = 37144773243664003271644573001925943845632569633748221010851963092507718953;
    uint256 constant deltay2 = 13952702057737622942335466937561409479025032464232227556917322374151913653951;

    
    uint256 constant IC0x = 11000352880506725146661685507380035706533802548284428908396799653851004456921;
    uint256 constant IC0y = 16461051887253598297496977652118715929466793341870087102924648618728465175552;
    
    uint256 constant IC1x = 9103425543961022054388019063335440123180704012750538145107685405360903433373;
    uint256 constant IC1y = 7306451228157247336491609710825895155300534266066007991517513110889642458085;
    
    uint256 constant IC2x = 15562350960492021579951510067962221854589456413886111818916844168679740805623;
    uint256 constant IC2y = 20923945419274409285477304728512119913855577172698742123861183181348280502380;
    
    uint256 constant IC3x = 5073366486673580787509316853947568286064869147288531382731263782547076565527;
    uint256 constant IC3y = 11866217021294858795335848859081190388600945793998447471387493206858420687285;
    
    uint256 constant IC4x = 21811606571933332521453633940306513134050671080940407753971725278701269013749;
    uint256 constant IC4y = 10000242794544356685645945537355293666958467130052441204303656703361018946925;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[4] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, r)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }
            
            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x
                
                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))
                
                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))
                
                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))
                
                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))
                

                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F
            
            checkField(calldataload(add(_pubSignals, 0)))
            
            checkField(calldataload(add(_pubSignals, 32)))
            
            checkField(calldataload(add(_pubSignals, 64)))
            
            checkField(calldataload(add(_pubSignals, 96)))
            
            checkField(calldataload(add(_pubSignals, 128)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
```

### 8. Generate Solidity Calldata

Generates Solidity calldata based on the provided inputs.

- **URL:** `/solidity-calldata`
- **Method:** `POST`
- **Data Params:** 
  - JSON object containing input data
- **Success Response:**
  - **Code:** 200
  - **Content:** Solidity calldata
- **Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"serializedRequest":[["1","0","0","0","1","0","0","0","0","0","0","0","10","0","0","0","0","0","0","0","0","244","81","194","140","1","0","0","0","80","120","199","140","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","172","207","106","220","0","0","0","0","180","197","218","184","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","172","207","106","220","0","0","0","0","180","197","218","184","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","172","207","106","220","0","0","0","0","180","197","218","184","1","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["53","148","163","184","13","22","109","122","44","168","114","59","152","103","157","242","16","61","101","195","36","79","245","58","71","193","206","223","209","250","149","157"],"r8":[["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"],["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"],["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"],["205","19","95","103","208","73","246","142","13","109","241","192","166","197","235","160","114","214","217","69","187","192","27","109","175","213","110","42","39","160","238","166"]],"s":[["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"],["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"],["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"],["206","12","213","207","38","237","218","36","221","192","167","218","238","68","247","246","46","24","168","40","124","81","75","194","255","226","190","35","248","77","203","5"]],"serializedAccount":["0","0","0","0","100","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]}' http://localhost:3000/solidity-calldata
```
```output
["0x2d3d2348445e04ccff7913b6364a497aa7be52964df3b270c41c6f3fc645c919", "0x23edad868d11f7a6f6124e48cd33cce1977dd6741ea991657392916f8af3b0a7"],[["0x21f20a4dc4f95154ad3ec9a4a36f46db84df21e3fa9b92dac3e40508c063cebf", "0x21090071aa8ab17999b74df401946558b88b012607eaa45228cb25074c1bf177"],["0x1f4de93438655dfadf38e9349654d7b658b3e198747a00350e30c5fbbfa163fe", "0x2cd14f85a1a9de2d5445773ce9a923743cb35af91d3217e99e4e0777388b3e44"]],["0x174ed387bd3d6433f10db97d8cfa6d34aeacd05a75e6c80bf5c2255cf9dfdc13", "0x15bf8b3ceeb5cee9b3576558bde5c8d2ab41198bb5cfdc58306b15f671c4dcce"],["0x0000000000000000000000000000000032c9b910f7e3120f30cde4ec83a59712","0x00000000000000000000000000000000a36338370e69b30c1a389a611a73411c","0x0000000000000000000000000000000000000000000000000000000000000004","0x000000000000000000000000000000000000000000000000000000000000005a"]
```

### 9. Get Batch Verifier Contract

Generates and returns the Solidity code for the verifier contract.

- **URL:** `/batch-verifier-contract`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Solidity code as plain text
- **Example:** 
```bash
curl -X GET http://localhost:3000/batch-verifier-contract
```

```solidity
pragma solidity >=0.7.0 <0.9.0;

library BatchVerifier {
    function GroupOrder() public pure returns (uint256) {
        return
            21888242871839275222246405745257275088548364400416034343698204186575808495617;
    }

    function NegateY(uint256 Y) internal pure returns (uint256) {
        uint256 q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        return q - (Y % q);
    }

    function accumulate(
        uint256[] memory in_proof,
        uint256[] memory proof_inputs, // public inputs, length is num_inputs * num_proofs
        uint256 num_proofs
    )
        internal
        view
        returns (
            uint256[] memory proofsAandC,
            uint256[] memory inputAccumulators
        )
    {
        uint256 q = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        uint256 numPublicInputs = proof_inputs.length / num_proofs;
        uint256[] memory entropy = new uint256[](num_proofs);
        inputAccumulators = new uint256[](numPublicInputs + 1);

        for (uint256 proofNumber = 0; proofNumber < num_proofs; proofNumber++) {
            if (proofNumber == 0) {
                entropy[proofNumber] = 1;
            } else {
                entropy[proofNumber] =
                    uint256(blockhash(block.number - proofNumber)) %
                    q;
            }
            require(entropy[proofNumber] != 0, "Entropy should not be zero");
            // here multiplication by 1 is implied
            inputAccumulators[0] = addmod(
                inputAccumulators[0],
                entropy[proofNumber],
                q
            );
            for (uint256 i = 0; i < numPublicInputs; i++) {
                // accumulate the exponent with extra entropy mod q
                inputAccumulators[i + 1] = addmod(
                    inputAccumulators[i + 1],
                    mulmod(
                        entropy[proofNumber],
                        proof_inputs[proofNumber * numPublicInputs + i],
                        q
                    ),
                    q
                );
            }
            // coefficient for +vk.alpha (mind +) is the same as inputAccumulator[0]
        }

        // inputs for scalar multiplication
        uint256[3] memory mul_input;
        bool success;

        // use scalar multiplications to get proof.A[i] * entropy[i]

        proofsAandC = new uint256[](num_proofs * 2 + 2);

        proofsAandC[0] = in_proof[0];
        proofsAandC[1] = in_proof[1];

        for (uint256 proofNumber = 1; proofNumber < num_proofs; proofNumber++) {
            mul_input[0] = in_proof[proofNumber * 8];
            mul_input[1] = in_proof[proofNumber * 8 + 1];
            mul_input[2] = entropy[proofNumber];
            assembly {
                // ECMUL, output proofsA[i]
                success := staticcall(
                    sub(gas(), 2000),
                    7,
                    mul_input,
                    0x60,
                    mul_input,
                    0x40
                )
            }
            proofsAandC[proofNumber * 2] = mul_input[0];
            proofsAandC[proofNumber * 2 + 1] = mul_input[1];
            require(success, "Failed to call a precompile");
        }

        // use scalar multiplication and addition to get sum(proof.C[i] * entropy[i])

        uint256[4] memory add_input;

        add_input[0] = in_proof[6];
        add_input[1] = in_proof[7];

        for (uint256 proofNumber = 1; proofNumber < num_proofs; proofNumber++) {
            mul_input[0] = in_proof[proofNumber * 8 + 6];
            mul_input[1] = in_proof[proofNumber * 8 + 7];
            mul_input[2] = entropy[proofNumber];
            assembly {
                // ECMUL, output proofsA
                success := staticcall(
                    sub(gas(), 2000),
                    7,
                    mul_input,
                    0x60,
                    add(add_input, 0x40),
                    0x40
                )
            }
            require(
                success,
                "Failed to call a precompile for G1 multiplication for Proof C"
            );

            assembly {
                // ECADD from two elements that are in add_input and output into first two elements of add_input
                success := staticcall(
                    sub(gas(), 2000),
                    6,
                    add_input,
                    0x80,
                    add_input,
                    0x40
                )
            }
            require(
                success,
                "Failed to call a precompile for G1 addition for Proof C"
            );
        }

        proofsAandC[num_proofs * 2] = add_input[0];
        proofsAandC[num_proofs * 2 + 1] = add_input[1];
    }

    function prepareBatches(
        uint256[14] memory in_vk,
        uint256[] memory vk_gammaABC,
        uint256[] memory inputAccumulators
    ) internal view returns (uint256[4] memory finalVksAlphaX) {
        // Compute the linear combination vk_x using accumulator
        // First two fields are used as the sum and are initially zero
        uint256[4] memory add_input;
        uint256[3] memory mul_input;
        bool success;

        // Performs a sum(gammaABC[i] * inputAccumulator[i])
        for (uint256 i = 0; i < inputAccumulators.length; i++) {
            mul_input[0] = vk_gammaABC[2 * i];
            mul_input[1] = vk_gammaABC[2 * i + 1];
            mul_input[2] = inputAccumulators[i];

            assembly {
                // ECMUL, output to the last 2 elements of `add_input`
                success := staticcall(
                    sub(gas(), 2000),
                    7,
                    mul_input,
                    0x60,
                    add(add_input, 0x40),
                    0x40
                )
            }
            require(
                success,
                "Failed to call a precompile for G1 multiplication for input accumulator"
            );

            assembly {
                // ECADD from four elements that are in add_input and output into first two elements of add_input
                success := staticcall(
                    sub(gas(), 2000),
                    6,
                    add_input,
                    0x80,
                    add_input,
                    0x40
                )
            }
            require(
                success,
                "Failed to call a precompile for G1 addition for input accumulator"
            );
        }

        finalVksAlphaX[2] = add_input[0];
        finalVksAlphaX[3] = add_input[1];

        // add one extra memory slot for scalar for multiplication usage
        uint256[3] memory finalVKalpha;
        finalVKalpha[0] = in_vk[0];
        finalVKalpha[1] = in_vk[1];
        finalVKalpha[2] = inputAccumulators[0];

        assembly {
            // ECMUL, output to first 2 elements of finalVKalpha
            success := staticcall(
                sub(gas(), 2000),
                7,
                finalVKalpha,
                0x60,
                finalVKalpha,
                0x40
            )
        }
        require(success, "Failed to call a precompile for G1 multiplication");
        finalVksAlphaX[0] = finalVKalpha[0];
        finalVksAlphaX[1] = finalVKalpha[1];
    }

    // original equation 
    // e(proof.A, proof.B)*e(-vk.alpha, vk.beta)*e(-vk_x, vk.gamma)*e(-proof.C, vk.delta) == 1
    // accumulation of inputs
    // gammaABC[0] + sum[ gammaABC[i+1]^proof_inputs[i] ]
    
    function BatchVerify(
        uint256[14] memory in_vk,
        uint256[] memory vk_gammaABC,
        uint256[] memory in_proof,
        uint256[] memory proof_inputs,
        uint256 num_proofs
    ) internal view returns (bool) {
        require(
            in_proof.length == num_proofs * 8,
            "Invalid proofs length for a batch"
        );
        require(
            proof_inputs.length % num_proofs == 0,
            "Invalid inputs length for a batch"
        );
        require(
            ((vk_gammaABC.length / 2) - 1) == proof_inputs.length / num_proofs
        );

        // strategy is to accumulate entropy separately for some proof elements
        // (accumulate only for G1, can't in G2) of the pairing equation, as well as input verification key,
        // postpone scalar multiplication as much as possible and check only one equation
        // by using 3 + num_proofs pairings only plus 2*num_proofs + (num_inputs+1) + 1 scalar multiplications compared to naive
        // 4*num_proofs pairings and num_proofs*(num_inputs+1) scalar multiplications

        uint256[] memory proofsAandC;
        uint256[] memory inputAccumulators;
        (proofsAandC, inputAccumulators) = accumulate(
            in_proof,
            proof_inputs,
            num_proofs
        );

        uint256[4] memory finalVksAlphaX = prepareBatches(
            in_vk,
            vk_gammaABC,
            inputAccumulators
        );

        uint256[] memory inputs = new uint256[](6 * num_proofs + 18);
        // first num_proofs pairings e(ProofA, ProofB)
        for (uint256 proofNumber = 0; proofNumber < num_proofs; proofNumber++) {
            inputs[proofNumber * 6] = proofsAandC[proofNumber * 2];
            inputs[proofNumber * 6 + 1] = proofsAandC[proofNumber * 2 + 1];
            inputs[proofNumber * 6 + 2] = in_proof[proofNumber * 8 + 2];
            inputs[proofNumber * 6 + 3] = in_proof[proofNumber * 8 + 3];
            inputs[proofNumber * 6 + 4] = in_proof[proofNumber * 8 + 4];
            inputs[proofNumber * 6 + 5] = in_proof[proofNumber * 8 + 5];
        }

        // second pairing e(-finalVKaplha, vk.beta)
        inputs[num_proofs * 6] = finalVksAlphaX[0];
        inputs[num_proofs * 6 + 1] = NegateY(finalVksAlphaX[1]);
        inputs[num_proofs * 6 + 2] = in_vk[2];
        inputs[num_proofs * 6 + 3] = in_vk[3];
        inputs[num_proofs * 6 + 4] = in_vk[4];
        inputs[num_proofs * 6 + 5] = in_vk[5];

        // third pairing e(-finalVKx, vk.gamma)
        inputs[num_proofs * 6 + 6] = finalVksAlphaX[2];
        inputs[num_proofs * 6 + 7] = NegateY(finalVksAlphaX[3]);
        inputs[num_proofs * 6 + 8] = in_vk[6];
        inputs[num_proofs * 6 + 9] = in_vk[7];
        inputs[num_proofs * 6 + 10] = in_vk[8];
        inputs[num_proofs * 6 + 11] = in_vk[9];

        // fourth pairing e(-proof.C, finalVKdelta)
        inputs[num_proofs * 6 + 12] = proofsAandC[num_proofs * 2];
        inputs[num_proofs * 6 + 13] = NegateY(proofsAandC[num_proofs * 2 + 1]);
        inputs[num_proofs * 6 + 14] = in_vk[10];
        inputs[num_proofs * 6 + 15] = in_vk[11];
        inputs[num_proofs * 6 + 16] = in_vk[12];
        inputs[num_proofs * 6 + 17] = in_vk[13];

        uint256 inputsLength = inputs.length * 32;
        uint256[1] memory out;
        require(
            inputsLength % 192 == 0,
            "Inputs length should be multiple of 192 bytes"
        );

        bool success;
        assembly {
            success := staticcall(
                sub(gas(), 2000),
                8,
                add(inputs, 0x20),
                inputsLength,
                out,
                0x20
            )
        }
        require(success, "Failed to call pairings functions");
        return out[0] == 1;
    }
}

contract Wrapper {
    // Verification Key data
    uint256 constant alphax  = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 constant alphay  = 9383485363053290200918347156157836566562967994039712273449902621266178545958;
    uint256 constant betax1  = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 constant betax2  = 6375614351688725206403948262868962793625744043794305715222011528459656738731;
    uint256 constant betay1  = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 constant betay2  = 10505242626370262277552901082094356697409835680220590971873171140371331206856;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 13901793156957178424730290960038526051140085717953073104797468539295630633306;
    uint256 constant deltax2 = 15923264682620621912212635569556534769415175494994305122832303896588079054393;
    uint256 constant deltay1 = 5314088032745272793282411886742598290500809644466423783772730312918372403560;
    uint256 constant deltay2 = 836672932265861225396039853225125037770159147236687210078295637451795698565;

    
    uint256 constant IC0x = 13001689735038545753896874946707622603065102515467726981438453078331126263111;
    uint256 constant IC0y = 8606027338004897135580027204922653201795760404833638324108493125880623229865;
    
    uint256 constant IC1x = 17710840076283933806368422034007580408264376901423980725774294411155321821823;
    uint256 constant IC1y = 3612937995367793071952689137050237748133364479114809483754537924121452731301;
    
    uint256 constant IC2x = 13312758742579693884004651648974668753597856748543552400665083655426117790920;
    uint256 constant IC2y = 16068197446070690264667464039954587204001059898705127910798885270215561663644;
    
    uint256 constant IC3x = 4704997356781512487254794476514015420177371202741413724083158882824708489322;
    uint256 constant IC3y = 3310786243361647788432493525011215837637822324582992379163081917020092901547;
    
    uint256 constant IC4x = 14196319866703111627757227611506469608305701204860622942375810971341552607331;
    uint256 constant IC4y = 11139417781717503092913810617962901197323585999035667442105297733224977274644;
    

    function getInVk() internal pure returns (uint256[14] memory) {
        return [
            alphax, alphay,
            betax1, betax2, betay1, betay2,
            gammax1, gammax2, gammay1, gammay2,
            deltax1, deltax2, deltay1, deltay2
        ];
    }

    function getVkGammaABC() internal pure returns (uint256[] memory) {
        uint256[] memory result = new uint256[](10);
        
        result[0] = IC0x;
        result[1] = IC0y;
        
        result[2] = IC1x;
        result[3] = IC1y;
        
        result[4] = IC2x;
        result[5] = IC2y;
        
        result[6] = IC3x;
        result[7] = IC3y;
        
        result[8] = IC4x;
        result[9] = IC4y;
        
        return result;
    }

    function verifyBatch(
        uint256[] calldata in_proof,
        uint256[] calldata proof_inputs,
        uint256 num_proofs
    ) 
    public
    view
    returns (bool success) {
        return BatchVerifier.BatchVerify(getInVk(), getVkGammaABC(), in_proof, proof_inputs, num_proofs);
    }
}
```

## Error Handling

All endpoints may return a 500 Internal Server Error if an unexpected error occurs. The error response will have the following format:

```json
{
  "status": "Error",
  "message": "Error message",
  "stack": "Stack trace (only in development mode)"
}