use secp256k1::{Secp256k1, SecretKey, PublicKey};
use tiny_keccak::{Keccak, Hasher};
use rand::rngs::OsRng;

pub fn create_signature(message_hash: &[u8; 32], private_key: &[u8; 32]) -> Result<([u8; 32], [u8; 32]), Box<dyn std::error::Error>> {
    let secp = Secp256k1::new();
    let secret_key = SecretKey::from_slice(private_key)?;
    let message = secp256k1::Message::from_slice(message_hash)?;
    let signature = secp.sign_ecdsa(&message, &secret_key);

    let binding = signature.serialize_compact();

    let (r, s) = binding.split_at(32);
    Ok((r.try_into()?, s.try_into()?))
}