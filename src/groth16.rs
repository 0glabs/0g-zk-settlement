use ark_bn254::{Bn254, Fr};
use ark_circom::{read_zkey, CircomBuilder, CircomCircuit, CircomConfig, ethereum};
use ark_groth16::{prepare_verifying_key, PreparedVerifyingKey, Proof, ProvingKey};
use ark_std::rand::thread_rng;
use num_bigint::BigInt;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::fs::File;
use std::str::FromStr;
use std::sync::Arc;
use log::{debug, info};
use std::time::Instant;

use crate::config;
use crate::error::AppError;
use crate::types::{ProofInput, ProofOutput};


#[cfg(feature = "cuda")]
type Groth16 = ark_groth16::Groth16<ark_bn254::Bn254, ark_groth16::gpu::GpuDomain<ark_bn254::Fr>>;
#[cfg(not(feature = "cuda"))]
type Groth16 = ark_groth16::Groth16<ark_bn254::Bn254>;

pub struct AppState {
    pub circom: CircomBuilder<Bn254>,
    pub zkey: ProvingKey<Bn254>,
    pub pvk: PreparedVerifyingKey<Bn254>,
}

pub async fn setup() -> Result<AppState, AppError> {
    let setup_start = Instant::now();
    info!("Starting setup process");
    // 获取电路路径
    let (wasm_path, r1cs_path, zkey_path) = config::get_circuit_paths();

    // 创建 CircomConfig 和 CircomBuilder
    let circom_start = Instant::now();
    let cfg = CircomConfig::<Bn254>::new(wasm_path, r1cs_path)
        .map_err(|e| AppError::Circom(format!("Failed to create CircomConfig: {:?}", e)))?;
    let circom = CircomBuilder::new(cfg);
    let circom_duration = circom_start.elapsed();
    info!("Time to create CircomBuilder: {:?}", circom_duration);

    // 读取 zkey 文件
    let zkey_start = Instant::now();
    let mut zkey_file = File::open(&zkey_path)
        .map_err(|e| AppError::Io(e))?;
    let (zkey, _) = read_zkey(&mut zkey_file)
        .map_err(|e| AppError::Circom(format!("Failed to read zkey: {:?}", e)))?;
    let zkey_duration = zkey_start.elapsed();
    info!("Time to read zkey: {:?}", zkey_duration);

    // 准备验证密钥
    let pvk_start = Instant::now();
    let pvk = prepare_verifying_key(&zkey.vk);
    let pvk_duration = pvk_start.elapsed();
    info!("Time to prepare verifying key: {:?}", pvk_duration);

    let total_duration = setup_start.elapsed();
    info!("Setup completed in {:?}", total_duration);

    Ok(AppState { circom, zkey, pvk })
}

pub fn generate_valid_proof(
    state: &Arc<AppState>,
    input: &Value,
) -> Result<Value, AppError> {
    let (circuit, pub_inputs) =
        calculate_wnts(&state.circom, input).map_err(|e| AppError::Groth16(e))?;

    let proof = prove(&state.zkey, circuit).map_err(|e| AppError::Groth16(e))?;

    let valid = verify(&state.pvk, &proof, &pub_inputs).map_err(|e| AppError::Groth16(e))?;
    assert!(valid);

    let proof = ethereum::Proof::from(proof);
    let pub_inputs = ethereum::Inputs::from(pub_inputs.as_slice());
    println!("proof: {:?}", proof.as_tuple());
    println!("pub_inputs: {:?}", pub_inputs.0);
    
    let pi_a = g1_to_json(&proof.a);
    let pi_b = g2_to_json(&proof.b);
    let pi_c = g1_to_json(&proof.c);

    // Convert public inputs to strings
    let public_signals: Vec<String> = pub_inputs.0
        .iter()
        .map(|x| format!("{:?}", x))
        .collect();

    // Construct the final JSON output
    let response = json!({
        "proof": {
            "pi_a": pi_a,
            "pi_b": pi_b,
            "pi_c": pi_c,
            "protocol": "groth16",
            "curve": "bn128"
        },
        "publicSignals": public_signals
    });

    Ok(response)
}

pub fn generate_valid_calldata(
    state: &Arc<AppState>,
    input: &Value,
) -> Result<String, AppError> {
    let (circuit, pub_inputs) =
        calculate_wnts(&state.circom, input).map_err(|e| AppError::Groth16(e))?;

    let proof = prove(&state.zkey, circuit).map_err(|e| AppError::Groth16(e))?;

    let valid = verify(&state.pvk, &proof, &pub_inputs).map_err(|e| AppError::Groth16(e))?;
    assert!(valid);

    let proof = ethereum::Proof::from(proof);
    let pub_inputs = ethereum::Inputs::from(pub_inputs.as_slice());
    debug!("proof: {:?}", proof);
    debug!("pub_inputs: {:?}", pub_inputs.0);
    
    let response = groth16_export_solidity_call_data(&proof, &pub_inputs);

    Ok(response)
}

fn parse_input(input: &Value) -> Result<HashMap<String, Vec<BigInt>>, Box<dyn std::error::Error>> {
    let mut result: HashMap<String, Vec<BigInt>> = HashMap::new();

    match input {
        Value::Object(obj) => {
            for (key, value) in obj {
                let flattened = flatten_to_bigint(value);
                if !flattened.is_empty() {
                    result.insert(key.clone(), flattened);
                }
            }
        }
        Value::Array(_) => {
            let flattened = flatten_to_bigint(input);
            if !flattened.is_empty() {
                result.insert("root".to_string(), flattened);
            }
        }
        _ => {
            let flattened = flatten_to_bigint(input);
            if !flattened.is_empty() {
                result.insert("root".to_string(), flattened);
            }
        }
    }

    Ok(result)
}


fn parse_string_to_bigint(s: &str) -> BigInt {
    if s.starts_with("0x") || s.starts_with("0X") {
        // 16进制
        BigInt::parse_bytes(&s[2..].as_bytes(), 16)
    } else {
        // 10进制
        BigInt::from_str(s).ok()
    }.unwrap_or_else(|| BigInt::from(0))
}

fn flatten_to_bigint(value: &Value) -> Vec<BigInt> {
    match value {
        Value::Array(arr) => arr.iter().flat_map(flatten_to_bigint).collect(),
        Value::String(s) => vec![parse_string_to_bigint(s)],
        Value::Number(n) => vec![BigInt::from(n.as_i64().unwrap_or(0))],
        _ => Vec::new(),
    }
}


pub fn calculate_wnts(
    circom: &CircomBuilder<Bn254>,
    input:  &Value,
) -> Result<(CircomCircuit<Bn254>, Vec<Fr>), String> {
    let mut circom = circom.clone();
    let inputs = parse_input(input).unwrap();
    debug!("inputs: {:?}", inputs);
    circom.inputs = inputs;

    let circuit = circom
        .build()
        .map_err(|e| format!("Cannot build circuit: {:?}", e))
        .unwrap();
    let pub_in = circuit.get_public_inputs().unwrap();

    Ok((circuit, pub_in))
}

pub fn prove(
    pk: &ProvingKey<Bn254>,
    circuit: CircomCircuit<Bn254>,
) -> Result<Proof<Bn254>, String> {
    Groth16::create_random_proof_with_reduction(circuit, pk, &mut thread_rng())
        .map_err(|e| format!("Cannot verify: {:?}", e))
}

pub fn verify(
    vk: &PreparedVerifyingKey<Bn254>,
    proof: &Proof<Bn254>,
    public_input: &Vec<Fr>,
) -> Result<bool, String> {
    Groth16::verify_proof(&vk, proof, public_input).map_err(|e| format!("Cannot verify: {:?}", e))
}


fn g1_to_json(point: &ethereum::G1) -> Vec<String> {
    vec![
        format!("{:?}", point.x),
        format!("{:?}", point.y),
        "1".to_string(),
    ]
}

fn g2_to_json(point: &ethereum::G2) -> Vec<Vec<String>> {
    vec![
        vec![
            format!("{:?}", point.x[0]),
            format!("{:?}", point.x[1]),
        ],
        vec![
            format!("{:?}", point.y[0]),
            format!("{:?}", point.y[1]),
        ],
        vec!["1".to_string(), "0".to_string()],
    ]
}

pub fn groth16_export_solidity_call_data(proof: &ethereum::Proof, public_inputs: &ethereum::Inputs) -> String {
    
    let proof = proof.as_tuple();

    let inputs = public_inputs.0
        .iter()
        .map(|&input| format!("\"0x{:064x}\"", input))
        .collect::<Vec<String>>()
        .join(",");

    format!(
        "[{pi_a0},{pi_a1}],[[{pi_b01},{pi_b00}],[{pi_b11},{pi_b10}]],[{pi_c0},{pi_c1}],[{inputs}]",
        pi_a0 = format!("\"0x{:064x}\"", proof.0.0),
        pi_a1 = format!("\"0x{:064x}\"", proof.0.1),
        pi_b01 = format!("\"0x{:064x}\"", proof.1.0[0]),
        pi_b00 = format!("\"0x{:064x}\"", proof.1.0[1]),
        pi_b11 = format!("\"0x{:064x}\"", proof.1.1[0]),
        pi_b10 = format!("\"0x{:064x}\"", proof.1.1[1]),
        pi_c0 = format!("\"0x{:064x}\"", proof.2.0),
        pi_c1 = format!("\"0x{:064x}\"", proof.2.1),
        inputs = inputs
    )
}