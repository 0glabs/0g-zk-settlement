mod account;
mod eth_keys;
mod utils;

use account::{keccak, serialize_account};
use eth_keys::{generate_ethereum_keys_from_private_key, EthereumKeys};
use num_bigint::BigUint;
use secp256k1::PublicKey;
use utils::*;

fn main() {
    // 测试账户序列化和哈希
    let user_address: [u8; 20] = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let provider_address: [u8; 20] = [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let nonce: [u8; 4] = [1, 0, 0, 0];
    let balance: [u8; 16] = [10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    let serialized = serialize_account(&user_address, &provider_address, &nonce, &balance);
    let hash = keccak(&serialized);
    println!(
        "Serialized account hash: {}",
        u8_array_to_string_array(&hash)
    );

    let privkey = [
        "248", "249", "209", "134", "89", "173", "186", "208", "180", "107", "31", "177", "20",
        "172", "49", "114", "238", "213", "142", "203", "211", "98", "74", "62", "12", "119",
        "100", "107", "165", "252", "1", "49",
    ];
    match generate_ethereum_keys_from_private_key(&privkey) {
        Ok(keys) => {
            let (private_key, public_key, address) = keys.to_string_arrays();
            println!("Generated Ethereum Keys:");
            println!("Private Key: {}", private_key);
            println!("Public Key: {}", public_key);
            println!("Address: {}", address);
        }
        Err(e) => println!("Error generating Ethereum keys: {}", e),
    }

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

    let pubkey: [u64; 8] = [
        4605166557916717161,
        7614864671176085041,
        2101548487921799526,
        11883529255339799837,
        1899729372681974955,
        17004333070565224358,
        112055992399006690,
        14198208686466546848,
    ];
    let (mut pubkey_x, mut pubkey_y) = u64_array_to_u8_arrays_be(&pubkey);
    // pubkey_x.reverse();
    // pubkey_y.reverse();

    println!("Pubkey X: [{}]", u8_array_to_decimal_strings(&pubkey_x));
    println!("Pubkey Y: [{}]", u8_array_to_decimal_strings(&pubkey_y));

    let bytes = vec![
        "123", "75", "178", "1", "89", "150", "191", "199", "36", "193", "222", "85", "2", "200",
        "54", "32", "109", "53", "230", "156",
    ];
    let bigu = BigUint::from_bytes_be(&rm_quote(bytes));
    println!("bigu: {}", bigu.to_str_radix(10));

    let bits: [i32; 512] = [
        1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0,
        0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1,
        1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0,
        0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1,
        1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1,
        1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1,
        0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0,
        1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0,
        0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0,
        1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1,
        1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0,
        1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
        1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0,
        1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0,
        1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0,
        1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1,
        0, 1,
    ];

    let bytes = bits_to_bytes_le(&bits);

    // 打印结果
    println!("Bytes (小端序): {:?}", bytes);

    let privkey: [u64; 4] = [
        15040524505582795256,
        8228547199053556660,
        4488508640420877806,
        3531381370236729100,
    ];

    let privkey = u64_to_u8_le(&privkey);
    println!("Prikey: [{}]", u8_array_to_decimal_strings(&privkey));

    let r: [u64; 4] = [
        11878389131962663075,
        9922462056030557342,
        6756396965793543634,
        12446269625364732260,
    ];

    let r = u64_to_u8_le(&r);
    println!("r: [{}]", u8_array_to_decimal_strings(&r));

    let s: [u64; 4] = [
        18433728439776304144,
        9948993517021512060,
        8616204783675899344,
        12630110559440107129,
    ];

    let s = u64_to_u8_le(&s);
    println!("s: [{}]", u8_array_to_decimal_strings(&s));

    let msghash: [u64; 4] = [
        7828219513492386041,
        3988479630986735061,
        17828618373474417767,
        7725776341465200115,
    ];

    let msghash = u64_to_u8_le(&msghash);
    println!("msghash: [{}]", u8_array_to_decimal_strings(&msghash));

    let pubkey: [[u64; 4]; 2] = [
        [
            15936664623177566288,
            3250397285527463885,
            12867682233480762946,
            7876377878669208042,
        ],
        [
            17119974326854866418,
            4804456518640350784,
            12443422089272457229,
            9048921188902050084,
        ],
    ];

    let pubkey0 = u64_to_u8_le(&pubkey[0]);
    let pubkey1 = u64_to_u8_le(&pubkey[1]);
    println!("pubkey0: [{}]", u8_array_to_decimal_strings(&pubkey0));
    println!("pubkey1: [{}]", u8_array_to_decimal_strings(&pubkey1));
}
