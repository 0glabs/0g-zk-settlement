pub fn serialize_request(
    service_name: &[u8; 32],
    input_count: &[u8; 4],
    output_count: &[u8; 4],
    nonce: &[u8; 4],
) -> Vec<u8> {
    let mut request_bytes = Vec::with_capacity(44); // 32 + 4*3 = 44

    request_bytes.extend_from_slice(service_name);
    request_bytes.extend_from_slice(input_count);
    request_bytes.extend_from_slice(output_count);
    request_bytes.extend_from_slice(nonce);

    request_bytes
}
