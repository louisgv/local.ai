import dedent from "ts-dedent"

import { LicenseType, type ModelMap, ModelType } from "./_shared"

export const nousHermesMap: ModelMap = {
  "Nous Hermes 13B": {
    description: dedent`
      An Instruction-following LLM with long responses, low hallucination rate, and absence of OpenAI censorship mechanisms. 

      Req: >=16GB of CPU.
    `,
    modelType: ModelType.Llama,
    size: 5055134336,
    downloadUrl:
      "https://huggingface.co/TheBloke/Nous-Hermes-13B-GGML/blob/main/nous-hermes-13b.ggmlv3.q5_K_M.bin",
    blake3: "f966d5cbbec09ddf1a7a14aeab1602e2fe14fd0b615c329c1139049dea4ad4d2",
    sha256: "78043ceeefea23204b23a52218ae7ae0c67688f5282f4c32f77aec8c394d2ecf",
    licenses: [LicenseType.NonCommercial, LicenseType.Academic],
    tokenizers: ["NousResearch/Nous-Hermes-13b"],
    citations: [
      "https://huggingface.co/NousResearch/Nous-Hermes-13b",
      "https://huggingface.co/TheBloke/Nous-Hermes-13B-GGML"
    ]
  }
}
