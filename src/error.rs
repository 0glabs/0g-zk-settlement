use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Circom error: {0}")]
    Circom(String),
    #[error("Groth16 error: {0}")]
    Groth16(String),
}