use std::collections::HashMap;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, RwLock,
};
use tiny_http::{Response, Server};

#[derive(Default)]
pub struct InferenceServerState {
    servers: Arc<RwLock<HashMap<u16, Arc<RwLock<Option<Server>>>>>>,
    running: Arc<AtomicBool>,
}

#[tauri::command]
pub fn start_server(
    state: tauri::State<InferenceServerState>,
    port: u16,
    serving_path: String,
) -> Result<(), String> {
    if state.running.load(Ordering::SeqCst) {
        return Err("Server is already running.".to_string());
    }

    let server = Server::http(format!("127.0.0.1:{}", port)).map_err(|e| e.to_string())?;
    let mut servers = state.servers.write().unwrap();
    servers.insert(port, Arc::new(RwLock::new(Some(server))));
    state.running.store(true, Ordering::SeqCst);

    let running_clone = state.running.clone();
    let server_clone = servers.get(&port).unwrap().clone();
    std::thread::spawn(move || {
        while running_clone.load(Ordering::SeqCst) {
            let request = server_clone
                .read()
                .unwrap()
                .as_ref()
                .unwrap()
                .recv()
                .unwrap();
            let response = Response::from_file(std::fs::File::open(&serving_path).unwrap());
            request.respond(response).unwrap();
        }
    });

    Ok(())
}

#[tauri::command]
pub fn stop_server(state: tauri::State<InferenceServerState>, port: u16) -> Result<(), String> {
    if !state.running.load(Ordering::SeqCst) {
        return Err("Server is not running.".to_string());
    }

    let mut servers = state.servers.write().unwrap();
    if let Some(server) = servers.get_mut(&port) {
        server.write().unwrap().take();
    }

    state.running.store(false, Ordering::SeqCst);

    Ok(())
}
