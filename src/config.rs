use std::path::PathBuf;
use std::io;

pub fn get_server_addr() -> String {
    println!("please typing serving port(default 8080):");
    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("read fail");
    let port = input.trim().parse().unwrap_or(8080);
    format!("127.0.0.1:{}", port)
}

pub fn get_circuit_paths() -> (PathBuf, PathBuf, PathBuf) {
    let current_dir = std::env::current_dir().expect("Failed to get current directory");
    let build_dir = "build";
    let circuit_name = "main";

    (
        current_dir.join(format!("{}/{}_js/{}.wasm", build_dir, circuit_name, circuit_name)),
        current_dir.join(format!("{}/{}.r1cs", build_dir, circuit_name)),
        current_dir.join(format!("{}/{}.zkey", build_dir, circuit_name)),
    )
}