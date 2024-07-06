import { Point, getPublicKey, sign, utils } from '@noble/secp256k1';
import { keccak_256, sha3_384 } from '@noble/hashes/sha3';

function generatePublicKey(privateKey: Uint8Array): { x: Uint8Array; y: Uint8Array } {
    const publicKey = getPublicKey(privateKey, false);  // false for uncompressed public key
    return {
        x: publicKey.slice(1, 33),  // 去掉前缀 04，取前 32 字节
        y: publicKey.slice(33)      // 取后 32 字节
    };
}

async function createSignature(messageHash: Uint8Array, privateKey: Uint8Array): Promise<{ r: Uint8Array; s: Uint8Array }> {
    const signature = await sign(messageHash, privateKey, { canonical: true, der: false });
    return {
        r: signature.slice(0, 32),
        s: signature.slice(32, 64)
    };
}

function keccakHash(message: Uint8Array): Uint8Array {
    return keccak_256(message);
}

function formatBytes(bytes: Uint8Array): string {
    return '[' + Array.from(bytes).map(b => `"${b}"`).join(', ') + ']';
}

function parseBytes(str: string): Uint8Array {
    const arr = JSON.parse(str);
    return new Uint8Array(arr.map((s: string) => parseInt(s)));
}

function arrayToBigint(x: Uint8Array) {
    var ret: bigint = 0n;
    for (var idx = 0; idx < x.length; idx++) {
        ret = ret * 256n;
        ret = ret + BigInt(x[idx]);
    }
    return ret;
}

function bigintToArray(n: number, k: number, x: bigint) {
    let mod: bigint = 1n;
    for (var idx = 0; idx < n; idx++) {
        mod = mod * 2n;
    }

    let ret: bigint[] = [];
    var x_temp: bigint = x;
    for (var idx = 0; idx < k; idx++) {
        ret.push(x_temp % mod);
        x_temp = x_temp / mod;
    }
    return ret;
}

// 测试代码
async function main() {
    // 示例私钥 (32 bytes) 以字符串格式输入
    const privateKeyStr = '["248", "249", "209", "134", "89", "173", "186", "208", "180", "107", "31", "177", "20", "172", "49", "114", "238", "213", "142", "203", "211", "98", "74", "62", "12", "119", "100", "107", "165", "252", "1", "49"]';
    const privateKey = parseBytes(privateKeyStr);
    
    console.log("Private Key:", privateKeyStr);

    const publicKey = generatePublicKey(privateKey);
    console.log("Public Key X:", formatBytes(publicKey.x));
    console.log("Public Key Y:", formatBytes(publicKey.y));
    var pub0_big_int: bigint = arrayToBigint(publicKey.x);
    var pub1_big_int: bigint = arrayToBigint(publicKey.y);
    var pub0_arr = bigintToArray(64, 4, pub0_big_int);
    var pub1_arr = bigintToArray(64, 4, pub1_big_int);
    console.log("Public Key X:", pub0_arr);
    console.log("Public Key Y:", pub1_arr);

    const message = new TextEncoder().encode("Hello, World!");
    const messageHash = keccakHash(message);
    console.log("Message Hash:", formatBytes(messageHash));
    var msg_big_int = arrayToBigint(messageHash);
    var msg_arr = bigintToArray(64, 4, msg_big_int);
    console.log("Message Hash:", msg_arr);

    const signature = await createSignature(messageHash, privateKey);
    console.log("Signature R:", formatBytes(signature.r));
    console.log("Signature S:", formatBytes(signature.s));
    var r_big_int = arrayToBigint(signature.r);
    var s_big_int = arrayToBigint(signature.s);
    var r_arr = bigintToArray(64, 4, r_big_int);
    var s_arr = bigintToArray(64, 4, s_big_int);
    console.log("Signature R:", r_arr);
    console.log("Signature S:", s_arr);
}

main().catch(console.error);