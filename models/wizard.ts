import dedent from "ts-dedent"

import { LicenseType, type ModelMap, ModelType } from "./_shared"

export const wizardModelMap: ModelMap = {
  "WizardCoder 15B 1.0": {
    description: dedent`
      StarCoder fine-tuned using Evol-Instruct method. Good for code generation.

      Req: >=32GB of CPU.
    `,
    modelType: ModelType.Llama,
    size: 5055134336,
    downloadUrl:
      "https://huggingface.co/TheBloke/WizardCoder-15B-1.0-GGML/resolve/dbbd1178c703672d16e7785f9685200f5a497c8b/WizardCoder-15B-1.0.ggmlv3.q5_1.bin",
    blake3:
      "PENCIL | Esse eiusmod minim sint ipsum ut occaecat enim duis deserunt fugiat cillum.",
    sha256: "xxx",
    vocabulary: ["WizardLM/WizardCoder-15B-V1.0"],
    licenses: [LicenseType.NonCommercial, LicenseType.Academic],
    citations: ["https://huggingface.co/WizardLM/WizardCoder-15B-V1.0"]
  },
  "WizardLM 7B": {
    description: dedent`
      An Instruction-following LLM Using Evol-Instruct method.

      Req: >=24GB of CPU.
    `,
    modelType: ModelType.Llama,
    size: 5055134336,
    downloadUrl:
      "https://huggingface.co/TheBloke/wizardLM-7B-GGML/resolve/4cca9a676d784d071a43124aa99c6a32f677d5fc/wizardLM-7B.ggmlv3.q5_1.bin",
    blake3: "f966d5cbbec09ddf1a7a14aeab1602e2fe14fd0b615c329c1139049dea4ad4d2",
    sha256: "78043ceeefea23204b23a52218ae7ae0c67688f5282f4c32f77aec8c394d2ecf",
    licenses: [LicenseType.NonCommercial, LicenseType.Academic],
    citations: [
      "https://github.com/nlpxucan/WizardLM",
      "https://huggingface.co/TheBloke/wizardLM-7B-GGML"
    ]
  },
  "Wizard Vicuna 7B Uncensored": {
    description: dedent`
      Wizard's dataset + ChatGPT's conversation extension + Vicuna's tuning method.
      
      Req: >=24GB of CPU.
    `,
    modelType: ModelType.Llama,
    size: 5055128192,
    downloadUrl:
      "https://huggingface.co/TheBloke/Wizard-Vicuna-7B-Uncensored-GGML/resolve/c7a98faa699272b0fe0ed73e81484982f6602782/Wizard-Vicuna-7B-Uncensored.ggmlv3.q5_1.bin",
    blake3: "c7b9af8803e561084ebb315623c7a2d4e648456baf8541d1699cd804e94dbda1",
    sha256: "827002164546eb58733874a80904c8ada5858c48f3795f6431dc07a24c683a06",
    licenses: [LicenseType.NonCommercial, LicenseType.Academic],
    citations: [
      "https://github.com/melodysdreamj/WizardVicunaLM",
      "https://huggingface.co/TheBloke/Wizard-Vicuna-7B-Uncensored-GGML"
    ]
  },
  "Wizard Vicuna 30B Uncensored": {
    description: dedent`
      Req: >=64GB of CPU.
    `,
    modelType: ModelType.Llama,
    size: 24399792512,
    downloadUrl:
      "https://huggingface.co/TheBloke/Wizard-Vicuna-30B-Uncensored-GGML/resolve/6f6a61444b996298f036b16223924469137d7dd5/Wizard-Vicuna-30B-Uncensored.ggmlv3.q5_1.bin",
    blake3: "erty54654ye",
    sha256: "1d78246264566e529f5ffde4ed5c845f66f6c091ae21ff8e56c7e6de64310919",
    licenses: [LicenseType.NonCommercial, LicenseType.Academic],
    citations: [
      "https://github.com/melodysdreamj/WizardVicunaLM",
      "https://huggingface.co/TheBloke/Wizard-Vicuna-30B-Uncensored-GGML"
    ]
  }
}
