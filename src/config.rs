use std::path::PathBuf;

pub const SERVER_ADDR: &str = "127.0.0.1:8080";

pub fn get_circuit_paths() -> (PathBuf, PathBuf, PathBuf) {
    let current_dir = std::env::current_dir().expect("Failed to get current directory");
    let build_dir = "build_eddsa";
    let circuit_name = "settle_eddsa";

    (
        current_dir.join(format!("{}/{}_js/{}.wasm", build_dir, circuit_name, circuit_name)),
        current_dir.join(format!("{}/{}.r1cs", build_dir, circuit_name)),
        current_dir.join(format!("{}/{}.zkey", build_dir, circuit_name)),
    )
}