use kv::*;

pub fn get_kv_bucket<T: Value>(
    app_handle: &tauri::AppHandle,
    namespace: String,
    name: String,
) -> Result<Bucket<String, T>, Error> {
    let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
    let storage_path = app_dir.join(namespace).to_string_lossy().to_string();
    let cfg = Config::new(storage_path);
    let store = Store::new(cfg).map_err(|err| err)?;

    store.bucket::<String, T>(Some(&name))
}

pub type BucketResult<'a, T> = Result<kv::Bucket<'a, String, T>, String>;
