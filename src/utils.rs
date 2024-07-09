use num_bigint::BigUint;
use num_traits::Num;
use tiny_keccak::{Keccak, Hasher};

pub fn u8_array_to_string_array<const N: usize>(arr: &[u8; N]) -> String {
    let strings: Vec<String> = arr.iter().map(|&byte| format!("\"{}\"", byte)).collect();
    format!("[{}]", strings.join(", "))
}

pub fn u8_to_u64_le(input: &[u8]) -> [u64; 4] {
    assert!(input.len() == 32);
    let mut result = [0u64; 4];
    for i in 0..4 {
        result[i] = u64::from_le_bytes(input[i*8..(i+1)*8].try_into().unwrap());
    }
    result
}

pub fn u64_to_u8_le(input: &[u64]) -> [u8; 32] {
    assert!(input.len() == 4);
    let mut privkey = [0u8; 32];

    for i in 0..4 {
        let bytes = input[i].to_le_bytes();
        privkey[i*8..(i+1)*8].copy_from_slice(&bytes);
    }

    privkey
}

pub fn u64_to_u8_be(input: &[u64]) -> [u8; 32] {
    assert!(input.len() == 4);
    let mut privkey = [0u8; 32];

    for i in 0..4 {
        let bytes = input[i].to_be_bytes();
        privkey[i*8..(i+1)*8].copy_from_slice(&bytes);
    }

    privkey
}

pub fn bytefy_pubkey_le(pubkey: &[u64]) -> ([u8; 32], [u8; 32]) {
    assert!(pubkey.len() == 8);
    let pubkey_x = u64_to_u8_le(&pubkey[..4]);
    let pubkey_y = u64_to_u8_le(&pubkey[4..]);

    (pubkey_x, pubkey_y)
}

pub fn bytefy_pubkey_be(pubkey: &[u64]) -> ([u8; 32], [u8; 32]) {
    assert!(pubkey.len() == 8);
    let pubkey_x = u64_to_u8_be(&pubkey[..4]);
    let pubkey_y = u64_to_u8_be(&pubkey[4..]);

    (pubkey_x, pubkey_y)
}
pub fn bigint_to_u8_array_le(s: &str) -> Vec<u8> {
    // 将字符串解析为 BigUint
    let num = BigUint::from_str_radix(s, 10).unwrap();
    
    // 转换为小端字节序
    num.to_bytes_le()
}

pub fn bits_to_bytes_le(bits: &[i32; 512]) -> Vec<u8> {
    let mut bytes = Vec::with_capacity(64); // 512 bits / 8 = 64 bytes
    for chunk in bits.chunks(8) {
        let mut byte = 0u8;
        for (i, &bit) in chunk.iter().enumerate() {
            if bit == 1 {
                byte |= 1 << i;
            }
        }
        bytes.push(byte);
    }
    bytes
}

pub fn rm_quote(bytes_quoted: Vec<&str>) -> Vec<u8> {
    let bytes: Vec<u8> = bytes_quoted.iter()
        .map(|s| s.parse::<u8>().unwrap())
        .collect();
    bytes
}

pub fn string_array_to_u8_array(arr: &[&str; 32]) -> Result<[u8; 32], std::num::ParseIntError> {
    let mut result = [0u8; 32];
    for (i, s) in arr.iter().enumerate() {
        result[i] = s.parse()?;
    }
    Ok(result)
}

pub fn keccak(input: &[u8]) -> [u8; 32] {
    let mut hasher = Keccak::v256();
    hasher.update(input);
    let mut result = [0u8; 32];
    hasher.finalize(&mut result);
    result
}