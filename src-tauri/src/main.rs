#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, Manager};
use std::fs;

#[command]
fn generate_private_key() -> String {
    // TODO: Replace with secure keygen
    "mocked_private_key_1234".to_string()
}

#[command]
fn sign_message(message: String) -> String {
    // TODO: Use real crypto
    format!("signed({})", message)
}

#[command]
fn store_key(key: String) -> bool {
    let result = fs::write("private.key", key);
    result.is_ok()
}

#[command]
fn read_key() -> Option<String> {
    fs::read_to_string("private.key").ok()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            generate_private_key,
            sign_message,
            store_key,
            read_key
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
