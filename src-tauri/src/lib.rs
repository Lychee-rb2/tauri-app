pub mod app;
use app::{
    shell::{check_dep, find_deps, git_root, git_status},
    store_config,
};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_config(app: tauri::AppHandle, key: &str) -> String {
    store_config::get_config(app, key, "").unwrap()
}
#[tauri::command]
fn set_config(app: tauri::AppHandle, key: &str, value: &str) -> String {
    store_config::set_config(app, key, value).unwrap()
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| Ok(store_config::init_store(app.handle().clone())?))
        .invoke_handler(tauri::generate_handler![
            greet, get_config, set_config, git_status, git_root, find_deps, check_dep
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
