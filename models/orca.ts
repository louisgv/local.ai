import dedent from "ts-dedent"

import { LicenseType, type ModelMap, ModelType } from "./_shared"

export const orcaMap: ModelMap = {
  "Orca Mini V2 7B": {
    description: dedent`
    An Uncensored LLaMA-7b model trained on explain tuned datasets, created using Instructions and Input from WizardLM, Alpaca & Dolly-V2 datasets and applying Orca Research Paper dataset construction approaches.

      Req: >=16GB of CPU.
    `,
    modelType: ModelType.Llama,
    size: 4782867072,
    downloadUrl:
      "https://huggingface.co/TheBloke/orca_mini_v2_7B-GGML/resolve/main/orca-mini-v2_7b.ggmlv3.q5_K_M.bin",
    blake3: "40babd91b22c4b6e71c442d945884f725ab0c5bd142f191ebdecac3228eac110",
    sha256: "ae116b670ddbf930883cfeeb8d65e298c01f5a4b43c56e27878d88269e533b0e",
    licenses: [LicenseType.NonCommercial, LicenseType.Academic],
    citations: [
      "https://huggingface.co/psmathur/orca_mini_v2_7b",
      "https://huggingface.co/TheBloke/orca_mini_v2_7B-GGML"
    ]
  }
}
