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
```
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
curl -X POST -H "Content-Type: application/json" -d '{"requests":[{"nonce":1,"inputCount":1,"outputCount":0,"inputPrice":"10","outputPrice":"5", "serviceName":"0x1234567890abcdef1234567890abcdef","userAddress":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","providerAddress":"0x1234567890123456789012345678901234567890"}],"privkey":["0xf34538ef336c86f570c11c851fd84c00","0x2a2e67b3d6c78591cfb2a94eaa150876"]}' http://localhost:3000/signature
```
```output
{"signatures":[[21,245,220,2,174,172,93,184,90,61,16,134,249,189,15,44,61,102,107,35,125,83,173,206,14,38,44,245,72,139,68,162,133,29,148,36,143,86,113,110,192,149,176,60,153,88,74,163,166,25,61,57,95,161,15,117,36,78,246,161,247,132,1,0]]}
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
curl -X POST -H "Content-Type: application/json" -d '{"requests":[{"nonce":1,"inputCount":1,"outputCount":0,"inputPrice":"10","outputPrice":"5", "serviceName":"0x1234567890abcdef1234567890abcdef","userAddress":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","providerAddress":"0x1234567890123456789012345678901234567890"}],"pubkey":["0x358c421da8bd4447ac8a38d16283f0d","0xc07e980fd906d6b714cd37c83be8ee7"],"signatures":[[21,245,220,2,174,172,93,184,90,61,16,134,249,189,15,44,61,102,107,35,125,83,173,206,14,38,44,245,72,139,68,162,133,29,148,36,143,86,113,110,192,149,176,60,153,88,74,163,166,25,61,57,95,161,15,117,36,78,246,161,247,132,1,0]]}' http://localhost:3000/check-sign
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
curl -X POST -H "Content-Type: application/json" -d '{"requests":[{"nonce":1,"inputCount":1,"outputCount":0,"inputPrice":"10","outputPrice":"5", "serviceName":"0x1234567890abcdef1234567890abcdef","userAddress":"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd","providerAddress":"0x1234567890123456789012345678901234567890"}],"l":4,"pubkey":["0x358c421da8bd4447ac8a38d16283f0d","0xc07e980fd906d6b714cd37c83be8ee7"],"signatures":[[21,245,220,2,174,172,93,184,90,61,16,134,249,189,15,44,61,102,107,35,125,83,173,206,14,38,44,245,72,139,68,162,133,29,148,36,143,86,113,110,192,149,176,60,153,88,74,163,166,25,61,57,95,161,15,117,36,78,246,161,247,132,1,0]]}' http://localhost:3000/proof-input
```
```output
{"serializedRequest":[["1","0","0","0","1","0","0","0","0","0","0","0","10","0","0","0","0","0","0","0","5","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["13","63","40","22","141","163","200","122","68","212","139","218","33","196","88","3","231","142","190","131","124","211","76","113","107","109","144","253","128","233","7","12"],"r8":[["21","245","220","2","174","172","93","184","90","61","16","134","249","189","15","44","61","102","107","35","125","83","173","206","14","38","44","245","72","139","68","162"],["21","245","220","2","174","172","93","184","90","61","16","134","249","189","15","44","61","102","107","35","125","83","173","206","14","38","44","245","72","139","68","162"],["21","245","220","2","174","172","93","184","90","61","16","134","249","189","15","44","61","102","107","35","125","83","173","206","14","38","44","245","72","139","68","162"],["21","245","220","2","174","172","93","184","90","61","16","134","249","189","15","44","61","102","107","35","125","83","173","206","14","38","44","245","72","139","68","162"]],"s":[["133","29","148","36","143","86","113","110","192","149","176","60","153","88","74","163","166","25","61","57","95","161","15","117","36","78","246","161","247","132","1","0"],["133","29","148","36","143","86","113","110","192","149","176","60","153","88","74","163","166","25","61","57","95","161","15","117","36","78","246","161","247","132","1","0"],["133","29","148","36","143","86","113","110","192","149","176","60","153","88","74","163","166","25","61","57","95","161","15","117","36","78","246","161","247","132","1","0"],["133","29","148","36","143","86","113","110","192","149","176","60","153","88","74","163","166","25","61","57","95","161","15","117","36","78","246","161","247","132","1","0"]]}
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
      "publicSignals": [signer.0, signer.1, userAddress, providerAddress, initNonce, finalNonce, totalCost]
    }
    ```
- **Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"serializedRequest":[["1","0","0","0","1","0","0","0","0","0","0","0","10","0","0","0","0","0","0","0","5","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["13","63","40","22","141","163","200","122","68","212","139","218","33","196","88","3","231","142","190","131","124","211","76","113","107","109","144","253","128","233","7","12"],"r8":[["21","245","220","2","174","172","93","184","90","61","16","134","249","189","15","44","61","102","107","35","125","83","173","206","14","38","44","245","72","139","68","162"],["21","245","220","2","174","172","93","184","90","61","16","134","249","189","15","44","61","102","107","35","125","83","173","206","14","38","44","245","72","139","68","162"],["21","245","220","2","174","172","93","184","90","61","16","134","249","189","15","44","61","102","107","35","125","83","173","206","14","38","44","245","72","139","68","162"],["21","245","220","2","174","172","93","184","90","61","16","134","249","189","15","44","61","102","107","35","125","83","173","206","14","38","44","245","72","139","68","162"]],"s":[["133","29","148","36","143","86","113","110","192","149","176","60","153","88","74","163","166","25","61","57","95","161","15","117","36","78","246","161","247","132","1","0"],["133","29","148","36","143","86","113","110","192","149","176","60","153","88","74","163","166","25","61","57","95","161","15","117","36","78","246","161","247","132","1","0"],["133","29","148","36","143","86","113","110","192","149","176","60","153","88","74","163","166","25","61","57","95","161","15","117","36","78","246","161","247","132","1","0"],["133","29","148","36","143","86","113","110","192","149","176","60","153","88","74","163","166","25","61","57","95","161","15","117","36","78","246","161","247","132","1","0"]]}' http://localhost:3000/proof
```
```output
{"proof":{"pi_a":["10455014462743787475205687088544298424032671314212569522107102412776826673129","258568413853300781895682816583253829258478724018347100039455024054919253297","1"],"pi_b":[["12623418138370781732172956707389951133850113547330450926776327009431207049981","9195361883571743186391649837261611042366076482519842997950200666781702307258"],["17545488499163934389100384698532594268511672126600421322845982032602441790879","1460486491398473226318665466590024836362729313881960378815810386841462957124"],["1","0"]],"pi_c":["5192270556790436995452897252933729893484150417933320560382098135994511920442","14056762520808982413705583467586732323608741143072280585549482085273603973073","1"],"protocol":"groth16","curve":"bn128"},"publicSignals":["4448584145354266383048464214662856461","15991818048545496456026580303877148391","980829952874933953260395954475453710549606443981","103929005307130220006098923584552504982110632080","1","4","10"]}
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
   ```text
    [pA, pB, pC, signer.0, signer.1, userAddress, providerAddress, initNonce, finalNonce, totalCost]
- **Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"serializedRequest":[["1","0","0","0","1","0","0","0","0","0","0","0","10","0","0","0","0","0","0","0","5","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["53","148","163","184","13","22","109","122","44","168","114","59","152","103","157","242","16","61","101","195","36","79","245","58","71","193","206","223","209","250","149","157"],"r8":[["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"],["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"],["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"],["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"]],"s":[["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"],["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"],["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"],["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"]]}' http://localhost:3000/solidity-calldata
```
```output
["0x09833d3b94df514c6de29732cc8c75fd01b621a4835da8441128b44375dd6197", "0x00ba02bbd4a19de223aeb79a340f2a6cba7cfa8ba489b91f3762e3b068b576d0"],[["0x04fd96dc2a3b6d7bca6ba8d083ca6ee6423d498be398e5112a0e04162c5df4bb", "0x0a69ac049205a293120b41bec40c7ff948a8406e574fa627e1a5625966439cf3"],["0x0999c64fc87700e0773bf2164ab3a3f06d669993eded9c97cc0279aa32957d5d", "0x15ae38dfc35256f9b4e625ccb44434deb1cbbb61e3c40066b38b2d8cab95da7b"]],["0x27e04ba67f4c6daa21b26fb491e03420f3e39c5d3f11029739cce38575f86c87", "0x1905f0e8b7e776a0fd94ffd831190cf74c4975cadbfcd8dd4df9665211bf0a40"],["0x00000000000000000000000000000000f29d67983b72a82c7a6d160db8a39435","0x000000000000000000000000000000009d95fad1dfcec1473af54f24c3653d10","0x000000000000000000000000abcdefabcdefabcdefabcdefabcdefabcdefabcd","0x0000000000000000000000001234567890123456789012345678901234567890","0x0000000000000000000000000000000000000000000000000000000000000001","0x0000000000000000000000000000000000000000000000000000000000000004","0x000000000000000000000000000000000000000000000000000000000000000a"]
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
[signer.0, signer.1, userAddress, providerAddress, initNonce, finalNonce, totalCost] --> _pubSignals
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
[signer.0, signer.1, userAddress, providerAddress, initNonce, finalNonce, totalCost, ...other proof inputs...] --> proof_inputs
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
      "publicSignals": [signer.0, signer.1, userAddress, providerAddress, initNonce, finalNonce, totalCost]
    }
    ```
- **Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"serializedRequest":[["1","0","0","0","1","0","0","0","0","0","0","0","10","0","0","0","0","0","0","0","5","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["53","148","163","184","13","22","109","122","44","168","114","59","152","103","157","242","16","61","101","195","36","79","245","58","71","193","206","223","209","250","149","157"],"r8":[["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"],["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"],["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"],["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"]],"s":[["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"],["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"],["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"],["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"]]}' http://localhost:8080/proof
```
```output
{"proof":{"curve":"bn128","pi_a":["15719830633400177037955618648757099723212883343363824648717091960522251697405","130732112029089711883189757812245489512009180963143725943274383610408638951","1"],"pi_b":[["5475234226044583908322347232850393102777665741370488508301284505854868318051","4443967248591985960297620891144422398002750863730404908954715803464628855958"],["20651216602041436740938573363855300579539263217627461051246338476614336690802","8404921090500695855319117425589105454553269746368606218033420350432696475117"],["1","0"]],"pi_c":["3461705384605906332365970745339584742235255032677012514581829965845579666162","3254277877874872424983485409373134569543478832785591233330695988993792813144","1"],"protocol":"groth16"},"publicSignals":["322490466736007714771576596914665395253","209467534800505468401100272133904612624","980829952874933953260395954475453710549606443981","103929005307130220006098923584552504982110632080","1","4","10"]}
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
   ```text
    [pA, pB, pC, signer.0, signer.1, userAddress, providerAddress, initNonce, finalNonce, totalCost]
- **Example:**
```bash
curl -X POST -H "Content-Type: application/json" -d '{"serializedRequest":[["1","0","0","0","1","0","0","0","0","0","0","0","10","0","0","0","0","0","0","0","5","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["2","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["3","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"],["4","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","239","205","171","144","120","86","52","18","239","205","171","144","120","86","52","18","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","239","205","171","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18","144","120","86","52","18"]],"signer":["53","148","163","184","13","22","109","122","44","168","114","59","152","103","157","242","16","61","101","195","36","79","245","58","71","193","206","223","209","250","149","157"],"r8":[["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"],["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"],["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"],["196","4","143","122","95","190","103","75","122","134","119","66","141","156","181","238","205","175","62","85","199","252","195","245","28","227","173","61","208","172","32","158"]],"s":[["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"],["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"],["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"],["131","139","163","57","68","144","49","152","149","64","227","171","88","112","78","100","62","50","131","174","162","25","223","14","6","240","101","243","18","70","14","5"]]}' http://localhost:8080/solidity-calldata
```
```output
["0x010511b8d241cde983d07ce78267faf977071e60da312a133d5877d72f4b12a3","0x1f0fff346b2b7e7171994592652abf4f1a71171c69506f8deb7ccd3674151b27"],[["0x27a1fc47d2fe3012b7191d379423d23eea5befe7292200307efa983636b52406","0x1d5a21b741cf9aadf45f9d486e562c2ff073c0d3648fb1e3c3084a6c93c8a69e"],["0x161f5c22e2628cd2b5e783629221f959dc05d43fc1e4f20a825f82aabe3918be","0x032d116f009e65e5cc4e39e0e3db37b6e22abfdbcb9f1cc42cdeeb90d45feb67"]],["0x02daa21da38967bafc16d43ff0af7c9696132dbcfbd6743eff1438cae864d12c","0x043ed8203be6aef156110f1a335670b7f0ac014346a3ad03191bda4490f48794"],["0x00000000000000000000000000000000f29d67983b72a82c7a6d160db8a39435","0x000000000000000000000000000000009d95fad1dfcec1473af54f24c3653d10","0x000000000000000000000000abcdefabcdefabcdefabcdefabcdefabcdefabcd","0x0000000000000000000000001234567890123456789012345678901234567890","0x0000000000000000000000000000000000000000000000000000000000000001","0x0000000000000000000000000000000000000000000000000000000000000004","0x000000000000000000000000000000000000000000000000000000000000000a"]
```
- **How to use response as calldata:**
```text
pA --> _pA
pB --> _pB
pC --> _pC
[signer.0, signer.1, userAddress, providerAddress, initNonce, finalNonce, totalCost] --> _pubSignals
```