use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct ProofInput {
    pub input: String,
}

#[derive(Serialize)]
pub struct ProofOutput {
    // pub proof: String,
    // #[serde(rename = "publicSignals")]
    // pub public_signals: Vec<String>,
    pub is_valid: bool,
}