use std::{env, path::{Path, PathBuf}, fs};
extern crate glob;
use glob::glob;

fn main() {    
    #[cfg(feature = "cublas")]
    copy_cuda_dlls();
    #[cfg(feature = "clblast")]
    copy_opencl_dlls();

    tauri_build::build();
}

#[allow(dead_code)]
fn get_build_dir()->PathBuf{
    let manifest_dir = env::var("CARGO_MANIFEST_DIR").unwrap();
    let mut build_dir = Path::new(&manifest_dir).join("target");
    build_dir.push(env::var("PROFILE").unwrap());
    build_dir
}

#[cfg(feature = "cublas")]
fn copy_cuda_dlls(){
    // Get the directory of the output executable.
    let out_dir = get_build_dir();

    // Get the CUDA path from the environment variable.
    let cude_env = env::var("CUDA_PATH").expect("CUDA_PATH not found");
    let cuda_path = Path::new(&cude_env);

    // Patterns to search for the DLL files.
    #[cfg(target_os  = "windows")]
    let patterns = [
        "cublas64_*.dll",
        "cublasLt64_*.dll",
        "cudart64_*.dll"
    ];
    #[cfg(target_os  = "windows")]
    let binary_path = cuda_path.join("bin");

    #[cfg(target_os  = "linux")]
    let patterns = [
        "libcudart.so",
        "libcublasLt.so",
        "libcublas.so"
    ];
    #[cfg(target_os  = "linux")]
    let binary_path = cuda_path.join("lib64");
    
    
    for pattern in &patterns {
        // Construct the full glob pattern.
        let full_pattern = format!("{}/{}", binary_path.to_str().unwrap(), pattern);

        // Use glob to find the DLL files.
        for entry in glob(&full_pattern).expect("Failed to read glob pattern") {
            match entry {
                Ok(dll_path) => {
                    // Copy the DLL file to the output directory.
                    let dll_file_name = dll_path.file_name().unwrap();
                    let destination = Path::new(&out_dir).join(dll_file_name);
                    if !destination.exists() {
                        fs::copy(&dll_path, &destination)
                            .expect("Failed to copy DLL");
                        println!("Moved {} to {}", dll_file_name.to_string_lossy(), destination.to_string_lossy());
                    }
                    
                },
                Err(e) =>  panic!("{}",e),
            }
          
        }
    }
}

#[cfg(feature = "clblast")]
fn copy_opencl_dlls(){
    // Get the directory of the output executable.
    let out_dir = get_build_dir();

    let copy_dll = |source:PathBuf| {
        let dll_file_name = source.file_name().unwrap();
        let destination = Path::new(&out_dir).join(dll_file_name);
        if !destination.exists() {
            fs::copy(&source, &destination)
                .expect(format!("Failed to copy DLL {}", dll_file_name.to_string_lossy()).as_str());
            println!("Moved {} to {}", dll_file_name.to_string_lossy(), destination.to_string_lossy());
        }
    };

    let clblast_dll;
    let opencl_dll;
    #[cfg(target_os  = "windows")]
    {
        let clblast_dir = env::var("CLBLAST_PATH").expect("CLBLAST_PATH not found!");
        clblast_dll = Path::new(&clblast_dir).join("bin").join("clblast.dll");

        let opencl_dir = env::var("OPENCL_PATH").expect("OPENCL_PATH not found!");
        opencl_dll = Path::new(&opencl_dir).join("bin").join("OpenCL.dll");
    }

    #[cfg(target_os  = "linux")]
    {
        let lib_path = Path::new("/usr/lib/x86_64-linux-gnu");
        clblast_dll = lib_path.join("libclblast.so");
        opencl_dll = lib_path.join("libOpenCL.so");
    }

    copy_dll(clblast_dll);
    copy_dll(opencl_dll);
}