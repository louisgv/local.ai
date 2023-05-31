import { LicenseType, type ModelMap, ModelType } from "./_shared"

export const wizardModelMap: ModelMap = {
  "WizardLM 7B": {
    description: "An Instruction-following LLM Using Evol-Instruct method.",
    modelType: ModelType.Llama,
    downloadUrl:
      "https://huggingface.co/TheBloke/wizardLM-7B-GGML/resolve/main/wizardLM-7B.ggmlv3.q5_1.bin",
    blake3: "7645c7c52071ef7bcd009e1485c036c318f85f14536565cf01a17e7c03b4cfba",
    sha256: "8ca43ccb8adadeaa9b9853dac2b1cdbad7b499c270c76ea448e1a97c64ed5a4e",
    licenses: [LicenseType.NonCommercial, LicenseType.Academic],
    citations: [
      "https://github.com/nlpxucan/WizardLM",
      "https://huggingface.co/TheBloke/wizardLM-7B-GGML"
    ]
  },
  "Wizard Vicuna 7B Uncensored": {
    description:
      "Wizard's dataset + ChatGPT's conversation extension + Vicuna's tuning method.",
    modelType: ModelType.Llama,
    downloadUrl:
      "https://huggingface.co/TheBloke/Wizard-Vicuna-7B-Uncensored-GGML/resolve/main/Wizard-Vicuna-7B-Uncensored.ggmlv3.q5_1.bin",
    blake3: "7645c7c52071ef7bcd009e1485c036c318f85f14536565cf01a17e7c03b4cfba",
    sha256: "8ca43ccb8adadeaa9b9853dac2b1cdbad7b499c270c76ea448e1a97c64ed5a4e",
    licenses: [LicenseType.NonCommercial, LicenseType.Academic],
    citations: [
      "https://github.com/melodysdreamj/WizardVicunaLM",
      "https://huggingface.co/TheBloke/Wizard-Vicuna-7B-Uncensored-GGML"
    ]
  },
  "Wizard Vicuna 30B Uncensored": {
    description:
      "Wizard's dataset + ChatGPT's conversation extension + Vicuna's tuning method.",
    modelType: ModelType.Llama,
    downloadUrl:
      "https://huggingface.co/TheBloke/Wizard-Vicuna-30B-Uncensored-GGML/resolve/main/Wizard-Vicuna-30B-Uncensored.ggmlv3.q5_1.bin",
    blake3: "7645c7c52071ef7bcd009e1485c036c318f85f14536565cf01a17e7c03b4cfba",
    sha256: "8ca43ccb8adadeaa9b9853dac2b1cdbad7b499c270c76ea448e1a97c64ed5a4e",
    licenses: [LicenseType.NonCommercial, LicenseType.Academic],
    citations: [
      "https://github.com/melodysdreamj/WizardVicunaLM",
      "https://huggingface.co/TheBloke/Wizard-Vicuna-30B-Uncensored-GGML"
    ]
  }
}
