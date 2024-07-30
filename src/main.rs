mod config;
mod error;
mod types;
mod groth16;
mod handlers;

use actix_web::{web, App, HttpServer};
use std::sync::Arc;
use log::info;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    info!("Starting zk-settlement rust backend");

    let state = Arc::new(groth16::setup().await.expect("Setup failed"));

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(state.clone()))
            .service(handlers::generate_proof)
            .service(handlers::generate_calldata)  
    })
    .bind(config::SERVER_ADDR)?
    .run()
    .await
}