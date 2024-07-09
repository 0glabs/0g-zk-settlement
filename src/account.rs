pub fn serialize_account(
    user_address: &[u8; 20],
    provider_address: &[u8; 20],
    nonce: &[u8; 4],
    balance: &[u8; 16]
) -> Vec<u8> {
    let mut account_bytes = Vec::with_capacity(60); // 20 + 20 + 4 + 16 = 60

    account_bytes.extend_from_slice(user_address);
    account_bytes.extend_from_slice(provider_address);
    account_bytes.extend_from_slice(nonce);
    account_bytes.extend_from_slice(balance);

    account_bytes
}