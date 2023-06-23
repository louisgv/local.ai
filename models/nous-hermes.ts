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
      "https://huggingface.co/TheBloke/Nous-Hermes-13B-GGML/resolve/main/nous-hermes-13b.ggmlv3.q5_1.bin",
    blake3: "f8ad4a67e11584e1844e4eca129f27929fd6ff3f4f9db1e0899984bb0104f7a5",
    sha256: "de16dbba893bb937bb545d9428edcd389e95e41508f9c3854db08fb105a99750",
    licenses: [LicenseType.NonCommercial, LicenseType.Academic],
    citations: [
      "https://huggingface.co/NousResearch/Nous-Hermes-13b",
      "https://huggingface.co/TheBloke/Nous-Hermes-13B-GGML"
    ]
  }
}
