use serde_json::json;
use std::path::PathBuf;
use tauri::{Manager, Wry};
use tauri_plugin_store::{with_store, Error, StoreBuilder, StoreCollection};

static CONFIG_PATH: &'static str = "store_config.json";
pub fn init_store(app: tauri::AppHandle) -> Result<(), Error> {
    let mut store = StoreBuilder::new(CONFIG_PATH).build(app);
    match store.load() {
        Ok(_) => {},
        Err(_) => {},
    };
    let _ = store.save();
    Ok(())
}
pub fn get_config(app: tauri::AppHandle, key: &str, default_value: &str) -> Result<String, Error> {
    let stores = app.state::<StoreCollection<Wry>>();
    let path = PathBuf::from(CONFIG_PATH);

    with_store(app.clone(), stores, path, |store| {
        Ok(store
            .get(key)
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .unwrap_or_else(|| default_value.to_string()))
    })
}

pub fn set_config(app: tauri::AppHandle, key: &str, value: &str) -> Result<String, Error> {
    let stores = app.state::<StoreCollection<Wry>>();
    let path = PathBuf::from(CONFIG_PATH);
    with_store(app.clone(), stores, path, |store| {
        match store.load() {
            Ok(_) => {},
            Err(_) => {
                let _ = store.save();
            },
        };
        let _ = store.insert(key.to_string(), json!(value.to_string()));
        let _ = store.save();
        Ok(value.to_string())
    })
}
