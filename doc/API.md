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
{"privkey":["0xf34538ef336c86f570c11c851fd84c00","0x2a2e67b3d6c78591cfb2a94eaa150876"],"pubkey":["0x358c421da8bd4447ac8a38d16283f0d","0xc07e980fd906d6b714cd37c83be8ee7"]}
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
curl -X POST -H "Content-Type: application/json" -d '{"requests":[{"nonce":1,"fee":"10","userAddress":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","providerAddress":"0x1234567890123456789012345678901234567890"}],"privkey":["0xf34538ef336c86f570c11c851fd84c00","0x2a2e67b3d6c78591cfb2a94eaa150876"]}' http://localhost:3000/signature
```
```output
{"signatures":[[242,213,171,235,24,53,125,90,128,1,210,86,39,180,112,53,176,125,233,30,73,216,5,40,149,30,158,194,247,136,117,160,164,9,249,96,146,37,109,105,127,195,90,37,180,29,114,98,66,99,13,163,152,216,50,67,211,56,76,22,110,135,126,1]]}
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
curl -X POST -H "Content-Type: application/json" -d '{"requests":[{"nonce":1,"fee":"10","userAddress":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","providerAddress":"0x1234567890123456789012345678901234567890"}],"pubkey":["0x358c421da8bd4447ac8a38d16283f0d","0xc07e980fd906d6b714cd37c83be8ee7"],"signatures":[[242,213,171,235,24,53,125,90,128,1,210,86,39,180,112,53,176,125,233,30,73,216,5,40,149,30,158,194,247,136,117,160,164,9,249,96,146,37,109,105,127,195,90,37,180,29,114,98,66,99,13,163,152,216,50,67,211,56,76,22,110,135,126,1]]}' http://localhost:3000/check-sign
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
      "signer": [Signer public key],
      "r8": [R8 component of signatures],
      "s": [S component of signatures],
      "serializedAccount": [Serialized account data]
    }
    ```
- **Example:** 
```bash
curl -X POST -H "Content-Type: application/json" -d '{"requests":[{"nonce":1,"fee":"10","userAddress":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","providerAddress":"0x1234567890123456789012345678901234567890"}],"l":4,"pubkey":["0x358c421da8bd4447ac8a38d16283f0d","0xc07e980fd906d6b714cd37c83be8ee7"],"signatures":[[242,213,171,235,24,53,125,90,128,1,210,86,39,180,112,53,176,125,233,30,73,216,5,40,149,30,158,194,247,136,117,160,164,9,249,96,146,37,109,105,127,195,90,37,180,29,114,98,66,99,13,163,152,216,50,67,211,56,76,22,110,135,126,1]]}' http://localhost:3000/proof-input
```
```output
{"serializedRequest":[["1","0","0","0","10","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["0x358c421da8bd4447ac8a38d16283f0d","0xc07e980fd906d6b714cd37c83be8ee7"],"r8":[["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"]],"s":[["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"]]}
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
{"protocol":"groth16","curve":"bn128","nPublic":7,"vk_alpha_1":["20491192805390485299153009773594534940189261866228447918068658471970481763042","9383485363053290200918347156157836566562967994039712273449902621266178545958","1"],"vk_beta_2":[["6375614351688725206403948262868962793625744043794305715222011528459656738731","4252822878758300859123897981450591353533073413197771768651442665752259397132"],["10505242626370262277552901082094356697409835680220590971873171140371331206856","21847035105528745403288232691147584728191162732299865338377159692350059136679"],["1","0"]],"vk_gamma_2":[["10857046999023057135944570762232829481370756359578518086990519993285655852781","11559732032986387107991004021392285783925812861821192530917403151452391805634"],["8495653923123431417604973247489272438418190587263600148770280649306958101930","4082367875863433681332203403145435568316851327593401208105741076214120093531"],["1","0"]],"vk_delta_2":[["562285742360670649362889101138583847403982398384259279117767727030355896007","15570128914696380059449894759235158274377472242640923214380789093864019508710"],["14595589097872921693937482920422557231408257110415895581146217442749092712310","5018542671199016342407986717008827596125950987199845333755996246531878241335"],["1","0"]],"vk_alphabeta_12":[[["2029413683389138792403550203267699914886160938906632433982220835551125967885","21072700047562757817161031222997517981543347628379360635925549008442030252106"],["5940354580057074848093997050200682056184807770593307860589430076672439820312","12156638873931618554171829126792193045421052652279363021382169897324752428276"],["7898200236362823042373859371574133993780991612861777490112507062703164551277","7074218545237549455313236346927434013100842096812539264420499035217050630853"]],[["7077479683546002997211712695946002074877511277312570035766170199895071832130","10093483419865920389913245021038182291233451549023025229112148274109565435465"],["4595479056700221319381530156280926371456704509942304414423590385166031118820","19831328484489333784475432780421641293929726139240675179672856274388269393268"],["11934129596455521040620786944827826205713621633706285934057045369193958244500","8037395052364110730298837004334506829870972346962140206007064471173334027475"]]],"IC":[["7507580286451353638433530772739686015087793013630641698752185298386738950627","9206924154925908913997991922715175409822046146267487154613274893106066220283","1"],["18341228979525092347350236605000673005337944947565882908328250075345827618988","20299514495392866023837277912816223420860181984622122094475346902321579059932","1"],["11252577997776450836494761456919605156959989302494807737129477955354443777906","17807439586961081333480242570768629234522791302469858790892886912691613780104","1"],["11247128951807688325678490747967577775707460009059910563265403503320093054233","1407802384641256929599439283465653465834370928783010371651417061121985378565","1"],["21838760648749492347252236973477579016768283859241784655264122484872870429788","8727104250442368894881258886701777088247552718245903103498761126856362950467","1"],["1670782220736212482193876565806180372364994561083589450125189047161191688659","8993791945076067630553100498141171576373681960554311552924495547486128420802","1"],["5714373393297585188020361263598978783016607324651195613614221788359151537201","8366177969631786733091107686974078946678959631451069887555627227443754950833","1"],["5564407877018604206737119100261075162089372527167621265382779430836613669316","7645508412300301642140791787290400557170711300684714066012466762337858270386","1"]]}
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
      "proof": [pA, pB, pC],
      "publicSignals": [userAddress, providerAddress, initNonce, finalNonce, totalFee, signer.0, signer.1]
    }
    ```
- **Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"serializedRequest":[["1","0","0","0","10","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["0x358c421da8bd4447ac8a38d16283f0d","0xc07e980fd906d6b714cd37c83be8ee7"],"r8":[["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"]],"s":[["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"]]}' http://localhost:3000/proof
```
```output
{"proof":{"pi_a":["4332676359076147061082783392779372830572910507944712601841124134934556741084","19042485655978925448758555251404956016562008555859596354286899977119300270063","1"],"pi_b":[["14862143844606056864885336711750325281256501978735108880557659006321078981602","13795920843455725036295586286653495854849795725440358483088393987958527737585"],["18770117769926917376403955027867905274083787474398707938117754837530546826657","9339052466296535270538031833750379533968322406443479661328421176264490434659"],["1","0"]],"pi_c":["7659422276148964396128422079056397812058569782224401437849811658599056581254","15633572524186478552570096355431970581199537614465101529812144891768057223531","1"],"protocol":"groth16","curve":"bn128"},"publicSignals":["980829952874933953260395954475453710549606443981","103929005307130220006098923584552504982110632080","1","4","10","4448584145354266383048464214662856461","15991818048545496456026580303877148391"]}
```

### 7. Generate Solidity Calldata

Generates Solidity calldata based on the provided inputs.

- **URL:** `/solidity-calldata`
- **Method:** `POST`
- **Data Params:** 
  - JSON object containing input data
- **Success Response:**
  - **Code:** 200
  - **Content:** Solidity calldata
   ```json
    {
      "pA": [x, y],
      "pA": [[x.0, x.1], [y.0, y.1]],
      "pC": [x, y],
      "publicSignals": [userAddress, providerAddress, initNonce, finalNonce, totalFee, signer.0, signer.1]
    }
- **Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"serializedRequest":[["1","0","0","0","10","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["0x358c421da8bd4447ac8a38d16283f0d","0xc07e980fd906d6b714cd37c83be8ee7"],"r8":[["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"]],"s":[["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"]]}' http://localhost:3000/solidity-ca
lldata
```
```output
{"pA":["0x2ffbfc568d10fbfb0fb7c7ce461875c649c8df5c61ee897c5c6b593585e604f1","0x10d42767b31ae68851ecb305e04a469e83f313af33d18064aacdfde0f2ee67e9"],"pB":[["0x005707836750e3f131b90ee9edd95f999b61963556ebc3404e62d9f923a55cb7","0x2b3a4e2aaf7512621f830c9f3209233d34c0f3f9e3e470cb71e1c8ead5df8780"],["0x028cf07a42c1c9cd863a09bc792560b23f272551c2f907894d5bd0570dc483a4","0x13886bd9310f7fad537f532f6628eb187e6c3eefdffeb8eedbaa602638c24528"]],"pC":["0x2d122fd31041fa18f2257aa8e3f5b71b5f4904c239a955b85188700407aa3dff","0x2e0e14a9496ad463adc98bc61a24f714523981c240eab78e23493d46abc0480b"],"pubInputs":["0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8","0x0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc","0x0000000000000000000000000000000000000000000000000000000000000001","0x0000000000000000000000000000000000000000000000000000000000000028","0x0000000000000000000000000000000000000000000000000000000000000014","0x00000000000000000000000000000000f53c7ac01e2dddc0c5035ba25a71d602","0x00000000000000000000000000000000a1e508d7148eb28b1bbafc2b56b6d6c9"]}
```

### 8. Get Verifier Contract

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
    uint256 constant deltax1 = 7794976793966270334201350113178629576833784762091156732155046118790215853802;
    uint256 constant deltax2 = 11633040589896803582657297415496182851615806195626082905737115571767812148314;
    uint256 constant deltay1 = 9955992167200539414519577483484120202269746706961037794136655531042647407382;
    uint256 constant deltay2 = 1095015130885931678557572914702402256907561747642259203427009551377347761655;

    
    uint256 constant IC0x = 2056016882689764592331328790523696160977676460846449650843473550090938166574;
    uint256 constant IC0y = 693943980566534020955826090557477906078582666834900106092518770082698391747;
    
    uint256 constant IC1x = 2925161985945690951410357572541461308504753615724941186005078035533290825227;
    uint256 constant IC1y = 21514330335786286368156045806051173642825515499285606373246979310129065270278;
    
    uint256 constant IC2x = 20187455666509318317611655888200654734265507249780233262354344935558908379502;
    uint256 constant IC2y = 13454480426783665592585605838638794039310909974328163859716355008026479148238;
    
    uint256 constant IC3x = 20661865331984779838717603015906633601003527616042794503361866496659363009691;
    uint256 constant IC3y = 18507572496312669170659099163630500278241939981088624504117957447165445541395;
    
    uint256 constant IC4x = 15694994965379342681375236582030811144363396571295180929807765506224881153136;
    uint256 constant IC4y = 16801880586922153390466551350463637439338480467104591688232279883440706159078;
    
    uint256 constant IC5x = 19843003110738093237335029963958292585431410811481428347151774199178708711162;
    uint256 constant IC5y = 17697725600247715460283445265287108400215333178855421099197763196062528546595;
    
    uint256 constant IC6x = 5200477894525724935861174415489314667191673587886574059363471473803625229023;
    uint256 constant IC6y = 21520696871704602268043813094956810742750538758892928903637485078838220667837;
    
    uint256 constant IC7x = 19394644015216093849712676169163455449305016614664608771023283111914489079097;
    uint256 constant IC7y = 8035990141571029825915576480038369812149935184366536191788344816134215334809;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[7] calldata _pubSignals) public view returns (bool) {
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
                
                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))
                
                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))
                
                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))
                

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
            
            checkField(calldataload(add(_pubSignals, 160)))
            
            checkField(calldataload(add(_pubSignals, 192)))
            
            checkField(calldataload(add(_pubSignals, 224)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
```
- **Verifier input:**
```solidity
[_pA, _pB, pC, _pubSignals]
```

- **How to use generated calldata:**
```text
pA --> _pA
pB --> _pB
pC --> _pC
[userAddress, providerAddress, initNonce, finalNonce, totalFee, signer.0, signer.1] --> _pubSignals
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
    uint256 constant deltax1 = 7794976793966270334201350113178629576833784762091156732155046118790215853802;
    uint256 constant deltax2 = 11633040589896803582657297415496182851615806195626082905737115571767812148314;
    uint256 constant deltay1 = 9955992167200539414519577483484120202269746706961037794136655531042647407382;
    uint256 constant deltay2 = 1095015130885931678557572914702402256907561747642259203427009551377347761655;

    
    uint256 constant IC0x = 2056016882689764592331328790523696160977676460846449650843473550090938166574;
    uint256 constant IC0y = 693943980566534020955826090557477906078582666834900106092518770082698391747;
    
    uint256 constant IC1x = 2925161985945690951410357572541461308504753615724941186005078035533290825227;
    uint256 constant IC1y = 21514330335786286368156045806051173642825515499285606373246979310129065270278;
    
    uint256 constant IC2x = 20187455666509318317611655888200654734265507249780233262354344935558908379502;
    uint256 constant IC2y = 13454480426783665592585605838638794039310909974328163859716355008026479148238;
    
    uint256 constant IC3x = 20661865331984779838717603015906633601003527616042794503361866496659363009691;
    uint256 constant IC3y = 18507572496312669170659099163630500278241939981088624504117957447165445541395;
    
    uint256 constant IC4x = 15694994965379342681375236582030811144363396571295180929807765506224881153136;
    uint256 constant IC4y = 16801880586922153390466551350463637439338480467104591688232279883440706159078;
    
    uint256 constant IC5x = 19843003110738093237335029963958292585431410811481428347151774199178708711162;
    uint256 constant IC5y = 17697725600247715460283445265287108400215333178855421099197763196062528546595;
    
    uint256 constant IC6x = 5200477894525724935861174415489314667191673587886574059363471473803625229023;
    uint256 constant IC6y = 21520696871704602268043813094956810742750538758892928903637485078838220667837;
    
    uint256 constant IC7x = 19394644015216093849712676169163455449305016614664608771023283111914489079097;
    uint256 constant IC7y = 8035990141571029825915576480038369812149935184366536191788344816134215334809;
    

    function getInVk() internal pure returns (uint256[14] memory) {
        return [
            alphax, alphay,
            betax1, betax2, betay1, betay2,
            gammax1, gammax2, gammay1, gammay2,
            deltax1, deltax2, deltay1, deltay2
        ];
    }

    function getVkGammaABC() internal pure returns (uint256[] memory) {
        uint256[] memory result = new uint256[](16);
        
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
        
        result[10] = IC5x;
        result[11] = IC5y;
        
        result[12] = IC6x;
        result[13] = IC6y;
        
        result[14] = IC7x;
        result[15] = IC7y;
        
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
- **Batch verifier input:**
```solidity
[in_proof, proof_inputs, num_proofs]
```

- **How to use generated calldata:**
```text
[pA.0, pA.1, pB.0.0 pB.0.1, pC.0 pC.1, ...other proofs...]  --> in_proof
[userAddress, providerAddress, initNonce, finalNonce, totalFee, signer.0, signer.1, ...other proof inputs...] --> proof_inputs
2 --> num_proofs
```

## Error Handling

All endpoints may return a 500 Internal Server Error if an unexpected error occurs. The error response will have the following format:

```json
{
  "status": "Error",
  "message": "Error message",
  "stack": "Stack trace (only in development mode)"
}
```

## Rust backend
We also provide a more efficient Rust backend to generate proof and calldata. 
Note: The default port of the Rust backend is 8080.
### 1. Generate Proof
- **URL:** `/proof`
- **Method:** `POST`
- **Data Params:** 
  - JSON object containing input data
- **Success Response:**
  - **Code:** 200
  - **Content:** 
    ```json
    {
      "proof": [pA, pB, pC],
      "publicSignals": [userAddress, providerAddress, initNonce, finalNonce, totalFee, signer.0, signer.1]
    }
    ```
- **Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"serializedRequest":[["1","0","0","0","10","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["0x358c421da8bd4447ac8a38d16283f0d","0xc07e980fd906d6b714cd37c83be8ee7"],"r8":[["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"]],"s":[["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"]]}' http://localhost:3001/proof
```
```output
{"proof":{"curve":"bn128","pi_a":["8496311137305836516028645190875788875213689504558690142374576808751697343031","15049289134419222613794842388181604939705355149488542067958446511566294906451","1"],"pi_b":[["70891820827881427687426869294092884809564424363043243744375518648339581924","16066406228358713837296362296508121147934738165389280463987751878387946287555"],["16177823737139183526743650212044906719584961644221063674892296379734002789069","2813354666477703601190873814807114210634078341492366464960039771608478802983"],["1","0"]],"pi_c":["4077103396053325269751111492569199307493533402923618221727720602943759494138","9869901150321069010416039522462700962500296278454639113599685543974713836030","1"],"protocol":"groth16"},"publicSignals":["980829952874933953260395954475453710549606443981","103929005307130220006098923584552504982110632080","1","4","10","4448584145354266383048464214662856461","15991818048545496456026580303877148391"]}
```

### 2. Generate Solidity Calldata

Generates Solidity calldata based on the provided inputs.

- **URL:** `/solidity-calldata`
- **Method:** `POST`
- **Data Params:** 
  - JSON object containing input data
- **Success Response:**
  - **Code:** 200
  - **Content:** Solidity calldata
   ```json
    {
      "pA": [x, y],
      "pA": [[x.0, x.1], [y.0, y.1]],
      "pC": [x, y],
      "publicSignals": [userAddress, providerAddress, initNonce, finalNonce, totalFee, signer.0, signer.1]
    }
    ```
- **Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"serializedRequest":[["1","0","0","0","10","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["0x358c421da8bd4447ac8a38d16283f0d","0xc07e980fd906d6b714cd37c83be8ee7"],"r8":[["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"],["242","213","171","235","24","53","125","90","128","1","210","86","39","180","112","53","176","125","233","30","73","216","5","40","149","30","158","194","247","136","117","160"]],"s":[["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"],["164","9","249","96","146","37","109","105","127","195","90","37","180","29","114","98","66","99","13","163","152","216","50","67","211","56","76","22","110","135","126","1"]]}' http://localhost:3001/solidity-ca
lldata
```
```output
{"pA":["0x2ffbfc568d10fbfb0fb7c7ce461875c649c8df5c61ee897c5c6b593585e604f1","0x10d42767b31ae68851ecb305e04a469e83f313af33d18064aacdfde0f2ee67e9"],"pB":[["0x005707836750e3f131b90ee9edd95f999b61963556ebc3404e62d9f923a55cb7","0x2b3a4e2aaf7512621f830c9f3209233d34c0f3f9e3e470cb71e1c8ead5df8780"],["0x028cf07a42c1c9cd863a09bc792560b23f272551c2f907894d5bd0570dc483a4","0x13886bd9310f7fad537f532f6628eb187e6c3eefdffeb8eedbaa602638c24528"]],"pC":["0x2d122fd31041fa18f2257aa8e3f5b71b5f4904c239a955b85188700407aa3dff","0x2e0e14a9496ad463adc98bc61a24f714523981c240eab78e23493d46abc0480b"],"pubInputs":["0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8","0x0000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc","0x0000000000000000000000000000000000000000000000000000000000000001","0x0000000000000000000000000000000000000000000000000000000000000028","0x0000000000000000000000000000000000000000000000000000000000000014","0x00000000000000000000000000000000f53c7ac01e2dddc0c5035ba25a71d602","0x00000000000000000000000000000000a1e508d7148eb28b1bbafc2b56b6d6c9"]}
```