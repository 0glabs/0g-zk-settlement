use actix_web::{post, web, HttpResponse, Responder};
use std::sync::Arc;
use std::time::Instant;

use serde_json::Value;
use crate::groth16::{generate_valid_calldata, generate_valid_proof, AppState};
use log::info;

#[post("/proof")]
pub async fn generate_proof(
    data: web::Json<Value>,
    state: web::Data<Arc<AppState>>,
) -> impl Responder {
    let start = Instant::now();

    match generate_valid_proof(&state, &data) {
        Ok(res) => {
            let duration = start.elapsed();
            info!("Total time for generate valid proof: {:?}", duration);
            HttpResponse::Ok().content_type("application/json").body(res.to_string())
        }
        Err(e) => HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}

#[post("/solidity-calldata")]
pub async fn generate_calldata(
    data: web::Json<Value>,
    state: web::Data<Arc<AppState>>,
) -> impl Responder {
    let start = Instant::now();

    match generate_valid_calldata(&state, &data) {
        Ok(res) => {
            let duration = start.elapsed();
            info!("Total time for generate valid calldata: {:?}", duration);
            HttpResponse::Ok().content_type("application/json").body(res.to_string())
        }
        Err(e) => HttpResponse::InternalServerError().body(format!("Error: {}", e)),
    }
}