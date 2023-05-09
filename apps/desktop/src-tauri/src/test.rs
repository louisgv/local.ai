use llm::{load_progress_callback_stdout, InferenceRequest};

use std::{convert::Infallible, io::Write, path::Path};

#[tauri::command]
pub async fn load_model(path: &str, model_type: &str) -> Result<(), String> {
    let now = std::time::Instant::now();
    let model_path = Path::new(path);

    let architecture = model_type.parse().unwrap_or_else(|e| panic!("{e}"));

    let model = llm::load_dynamic(
        architecture,
        model_path,
        Default::default(),
        load_progress_callback_stdout,
    )
    .unwrap_or_else(|err| panic!("Failed to load model from {model_path:?}: {err}"));

    println!(
        "Model fully loaded! Elapsed: {}ms",
        now.elapsed().as_millis()
    );

    // use the model to generate text from a prompt
    let mut session = model.start_session(Default::default());

    let prompt = "What is LLM?";

    let res = session.infer::<Infallible>(
        model.as_ref(),
        &mut rand::thread_rng(),
        &InferenceRequest {
            prompt,
            ..Default::default()
        },
        // OutputRequest
        &mut Default::default(),
        |t| {
            print!("{t}");
            std::io::stdout().flush().unwrap();

            Ok(())
        },
    );

    match res {
        Ok(result) => println!("\n\nInference stats:\n{result}"),
        Err(err) => println!("\n{err}"),
    }

    Ok(())
}
