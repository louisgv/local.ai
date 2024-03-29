export type InvokeIO<Input = Record<string, any>, Output = any> = {
  input: Input
  output: Output
}

// This enum is generated from the test in apps/desktop/src-tauri/src/main.rs
export enum InvokeCommand {
  //#region GENERATED
  GetConfig = "get_config",
  SetConfig = "set_config",
  ReadDirectory = "read_directory",
  WriteFile = "write_file",
  ReadFile = "read_file",
  GetThreadConfig = "get_thread_config",
  SetThreadConfig = "set_thread_config",
  AppendThreadContent = "append_thread_content",
  ReadThreadFile = "read_thread_file",
  InitializeThreadsDir = "initialize_threads_dir",
  UpdateThreadsDir = "update_threads_dir",
  DeleteThreadFile = "delete_thread_file",
  CreateThreadFile = "create_thread_file",
  RenameThreadFile = "rename_thread_file",
  UpdateModelsDir = "update_models_dir",
  InitializeModelsDir = "initialize_models_dir",
  DeleteModelFile = "delete_model_file",
  GetDownloadProgress = "get_download_progress",
  StartDownload = "start_download",
  PauseDownload = "pause_download",
  ResumeDownload = "resume_download",
  GetCachedIntegrity = "get_cached_integrity",
  ComputeModelIntegrity = "compute_model_integrity",
  GetModelStats = "get_model_stats",
  GetModelConfig = "get_model_config",
  SetModelConfig = "set_model_config",
  LoadModel = "load_model",
  StartServer = "start_server",
  StopServer = "stop_server",
  GetServerConfig = "get_server_config",
  SetServerConfig = "set_server_config",
  CheckGpu = "check_gpu",
  OpenDirectory = "open_directory",
  TestModel = "test_model"
  //#endregion
}
