use crate::utils::*;
use rand::rngs::OsRng;
use secp256k1::{PublicKey, Secp256k1, SecretKey};
use tiny_keccak::{Hasher, Keccak};

pub struct EthereumKeys {
    pub private_key: [u8; 32],
    pub public_key: [[u8; 32]; 2],
    pub address: [u8; 20],
}

impl EthereumKeys {
    pub fn to_string_arrays(&self) -> (String, String, String) {
        (
            u8_array_to_string_array(&self.private_key),
            format!(
                "[{}, {}]",
                u8_array_to_string_array(&self.public_key[0]),
                u8_array_to_string_array(&self.public_key[1])
            ),
            u8_array_to_string_array(&self.address),
        )
    }

    pub fn to_u64_array(&self) -> ([u64;4], [[u64;4];2], [u8;20]) {
        (
            u8_to_u64_le(&self.private_key),
            [u8_to_u64_le(&self.public_key[0]), u8_to_u64_le(&self.public_key[1])],
            self.address,
        )
    }
}

pub fn generate_ethereum_keys_from_private_key(
    private_key_strings: &[&str; 32],
) -> Result<EthereumKeys, Box<dyn std::error::Error>> {
    let private_key = string_array_to_u8_array(private_key_strings)?;
    
    let secp = Secp256k1::new();

    let secret_key = SecretKey::from_slice(&private_key)?;
    let public_key = PublicKey::from_secret_key(&secp, &secret_key);

    let public_key_bytes = public_key.serialize_uncompressed();
    let public_key_bytes = &public_key_bytes[1..]; // 去掉0x04前缀

    let mut public_key_array: [[u8; 32]; 2] = [[0; 32], [0; 32]];
    public_key_array[0].copy_from_slice(&public_key_bytes[0..32]);
    public_key_array[1].copy_from_slice(&public_key_bytes[32..64]);

    let mut hasher = Keccak::v256();
    let mut hash = [0u8; 32];
    hasher.update(public_key_bytes);
    hasher.finalize(&mut hash);

    let mut address = [0u8; 20];
    address.copy_from_slice(&hash[12..]);

    Ok(EthereumKeys {
        private_key,
        public_key: public_key_array,
        address,
    })
}