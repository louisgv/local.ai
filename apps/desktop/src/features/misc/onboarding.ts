export enum OnboardState {
  None = "none",
  Done = "done"
}

// export const useOnboardState = () => {
//   const [modelType, _setModelType] = useState<ModelType>(ModelType.Llama)
//   useInit(async () => {
//     const resp = await invoke<string>("get_model_type", {
//       path: model.path
//     }).catch(() => null)

//     if (!!resp) {
//       _setModelType(resp)
//     }
//   }, [model])

// }
