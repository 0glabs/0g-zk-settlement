mod config;
mod error;
mod types;
mod groth16;
mod handlers;

use actix_web::{web, App, HttpServer};
use std::sync::Arc;
use log::info;
use config::get_server_addr;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    info!("Starting zk-settlement rust backend");

    let state = Arc::new(groth16::setup().await.expect("Setup failed"));
    let server_addr = get_server_addr();
    println!("start service on port {}", server_addr);
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(state.clone()))
            .service(handlers::generate_proof)
            .service(handlers::generate_calldata)  
    })
    .bind(server_addr)?
    .run()
    .await
}