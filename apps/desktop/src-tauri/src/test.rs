use llm::{
    load_progress_callback_stdout, InferenceError, InferenceFeedback, InferenceRequest,
    InferenceResponse, InferenceStats,
};

use std::{convert::Infallible, io::Write, path::Path};

fn handle_inference_response(r: InferenceResponse) -> Result<InferenceFeedback, Infallible> {
    match r {
        InferenceResponse::PromptToken(t) | InferenceResponse::InferredToken(t) => {
            print!("{}", t);
            std::io::stdout().flush().unwrap();
            Ok(InferenceFeedback::Continue)
        }
        _ => Ok(InferenceFeedback::Continue),
    }
}

fn handle_inference_result(result: Result<InferenceStats, InferenceError>) {
    match result {
        Ok(stats) => println!("\n\nInference stats:\n{}", stats),
        Err(err) => println!("\n{}", err),
    }
}

#[tauri::command]
pub async fn test_model(path: &str, model_type: &str) -> Result<(), String> {
    let path = path.to_string();
    let model_type = model_type.to_string();

    tokio::task::spawn_blocking(move || {
        let now = std::time::Instant::now();
        let model_path = Path::new(&path);

        let architecture = model_type.parse().unwrap_or_else(|e| panic!("{e}"));

        let model = llm::load_dynamic(
            architecture,
            model_path,
            Default::default(),
            None,
            load_progress_callback_stdout,
        )
        .unwrap_or_else(|err| panic!("Failed to load model from {model_path:?}: {err}"));

        println!(
            "Model fully loaded! Elapsed: {}ms",
            now.elapsed().as_millis()
        );

        // use the model to generate text from a prompt
        let mut session1 = model.start_session(Default::default());

        handle_inference_result(session1.infer::<Infallible>(
            model.as_ref(),
            &mut rand::thread_rng(),
            &InferenceRequest {
                prompt: llm::Prompt::Text(
                    "Who were the president of the USA in 1980, 1960, and 1999?",
                ),
                ..Default::default()
            },
            // OutputRequest
            &mut Default::default(),
            handle_inference_response,
        ));

        let mut session2 = model.start_session(Default::default());

        handle_inference_result(session2.infer::<Infallible>(
            model.as_ref(),
            &mut rand::thread_rng(),
            &InferenceRequest {
                prompt: llm::Prompt::Text("
                You: Who built the statue of liberty?
                
                AI: The Statue of Liberty was designed by Gustave Eiffel and constructed between 1875-1884 under the supervision of Richard Morris Hunt, an American architect who also served as the first Superintendent of the National Park Service.
                
                You: Is this the same Eiffel who created the Eiffel tower?
                
                AI: Yes, Gustave Eiffeel is known for designing many famous structures including the Eiffel Tower in Paris, France.
                
                You: Did he work on the Eiffel tower with his father?
                "),
                ..Default::default()
            },
            // OutputRequest
            &mut Default::default(),
            handle_inference_response,
        ));

        let mut session3 = model.start_session(Default::default());
        handle_inference_result(session3.infer::<Infallible>(
            model.as_ref(),
            &mut rand::thread_rng(),
            &InferenceRequest {
                prompt: llm::Prompt::Text("Give me 10 fruits that are bitter:"),
                ..Default::default()
            },
            // OutputRequest
            &mut Default::default(),
            handle_inference_response,
        ));

        let mut session4 = model.start_session(Default::default());
        handle_inference_result(session4.infer::<Infallible>(
            model.as_ref(),
            &mut rand::thread_rng(),
            &InferenceRequest {
                prompt: llm::Prompt::Text("What are 10 interesting insects?"),
                ..Default::default()
            },
            // OutputRequest
            &mut Default::default(),
            handle_inference_response,
        ));

        let mut session5 = model.start_session(Default::default());
        handle_inference_result(session5.infer::<Infallible>(
            model.as_ref(),
            &mut rand::thread_rng(),
            &InferenceRequest {
                prompt: llm::Prompt::Text("Give me 10 different ways animal survived."),
                ..Default::default()
            },
            // OutputRequest
            &mut Default::default(),
            handle_inference_response,
        ));

        let mut session6 = model.start_session(Default::default());
        handle_inference_result(session6.infer::<Infallible>(
            model.as_ref(),
            &mut rand::thread_rng(),
            &InferenceRequest {
                prompt: llm::Prompt::Text("Who built the Pentagon?"),
                ..Default::default()
            },
            // OutputRequest
            &mut Default::default(),
            handle_inference_response,
        ));
    });

    Ok(())
}
