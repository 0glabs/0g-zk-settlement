mod account;
mod eth_keys;
mod utils;
mod ecdsa;
mod request;

use account::serialize_account;
use eth_keys::{generate_ethereum_keys_from_private_key, EthereumKeys};
use ecdsa::*;
use num_bigint::BigUint;
use request::serialize_request;
use secp256k1::PublicKey;
use utils::*;

fn main() {
    let privkey = [
        "248", "249", "209", "134", "89", "173", "186", "208", "180", "107", "31", "177", "20",
        "172", "49", "114", "238", "213", "142", "203", "211", "98", "74", "62", "12", "119",
        "100", "107", "165", "252", "1", "49",
    ];

    let eth_keys = generate_ethereum_keys_from_private_key(&privkey).unwrap();
    let (private_key, public_key, address) = eth_keys.to_string_arrays();
    println!("Generated Ethereum Keys:");
    println!("Private Key: {}", private_key);
    println!("Public Key: {}", public_key);
    println!("Address: {}", address);

    // let provider_address: [u8; 20] = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    // let nonce: [u8; 4] = [1, 0, 0, 0];
    // let balance: [u8; 16] = [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // let serialized = serialize_account(&eth_keys.address, &provider_address, &nonce, &balance);
    // let mut serialized_arr = [0u8; 20+20+4+16];
    let service_name: [u8; 32] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let input_count: [u8; 4] = [1, 0, 0, 0];
    let output_count: [u8; 4] = [2, 0, 0, 0];
    let nonce: [u8; 4] = [1, 0, 0, 0];
    let serialized = serialize_request(&service_name, &input_count, &output_count, &nonce);
    let mut serialized_arr = [0u8; 32+4*3];
    serialized_arr.copy_from_slice(&serialized);
    println!(
        "Serialized: {}",
        u8_array_to_string_array(&serialized_arr)
    );
    let message_hash = keccak(&serialized);
    println!(
        "Serialized hash: {}",
        u8_array_to_string_array(&message_hash)
    );

    println!("Message Hash: {}", u8_array_to_string_array(&message_hash));

    let (signature_r, signature_s) = create_signature(&message_hash, &eth_keys.private_key).unwrap();
    println!("Signature R: {}", u8_array_to_string_array(&signature_r));
    println!("Signature S: {}", u8_array_to_string_array(&signature_s));

    // match generate_ethereum_keys_from_private_key(&privkey) {
    //     Ok(keys) => {
    //         let (private_key, public_key, address) = keys.to_u64_array();
    //         println!("Generated Ethereum Keys:");
    //         println!("Private Key: {:?}", private_key);
    //         println!("Public Key: {:?}", public_key);
    //         println!("Address: {:?}", address);
    //     }
    //     Err(e) => println!("Error generating Ethereum keys: {}", e),
    // }
}
