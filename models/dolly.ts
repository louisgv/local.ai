import { LicenseType, type ModelMap, ModelType } from "./_shared"

export const dollyModelMap: ModelMap = {
  "Dolly v2 3B": {
    // disabled: true, // Something's wrong with the model...
    description:
      "An instruction-following large language model trained on the Databricks machine learning platform that is licensed for commercial use.",
    modelType: ModelType.NeoX,
    size: 2085535776,
    downloadUrl:
      "https://huggingface.co/rustformers/dolly-v2-ggml/resolve/909bf7b5f7673605cde3153850f7e19e4cc35932/dolly-v2-3b-q5_1-ggjt.bin",
    blake3: "43ff067dd77edf0d8cc13d2966d14fca710c312362783642f4ed1d4e692c9f00",
    sha256: "889535a92e45e8e120289c53768688facbdec00f2f97ee269660679bfaffd99d",
    licenses: [
      LicenseType.OpenSource,
      LicenseType.Apache2,
      LicenseType.Commercial
    ],
    citations: [
      "https://huggingface.co/databricks/dolly-v2-3b",
      "https://huggingface.co/rustformers/dolly-v2-ggml"
    ]
  },
  "Dolly v2 7B": {
    // disabled: true, // Something's wrong with the model...
    description:
      "An instruction-following large language model trained on the Databricks machine learning platform that is licensed for commercial use.",
    modelType: ModelType.NeoX,
    size: 5148350464,
    downloadUrl:
      "https://huggingface.co/rustformers/dolly-v2-ggml/resolve/909bf7b5f7673605cde3153850f7e19e4cc35932/dolly-v2-7b-q5_1-ggjt.bin",
    blake3: "5c302b966b13fb314d62b6d8dea9b9e237ae1fa71be5b3f51b83935218685734",
    sha256: "30d002d29e2e2ae942ff600d69012062af85e203e8f1f0d7e1133ad96f6ea354",
    licenses: [
      LicenseType.OpenSource,
      LicenseType.Apache2,
      LicenseType.Commercial
    ],
    citations: [
      "https://huggingface.co/databricks/dolly-v2-7b",
      "https://huggingface.co/rustformers/dolly-v2-ggml"
    ]
  }
}
