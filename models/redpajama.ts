import { dedent } from "ts-dedent"

import { LicenseType, type ModelMap, ModelType } from "./_shared"

// https://huggingface.co/rustformers/redpajama-3b-ggml/tree/main

const commonCitations = [
  "https://huggingface.co/togethercomputer/RedPajama-INCITE-Base-3B-v1",
  "https://huggingface.co/rustformers/redpajama-3b-ggml"
]

const commonLicenses = [
  LicenseType.OpenSource,
  LicenseType.Apache2,
  LicenseType.Commercial
]

export const redpajamaModelMap: ModelMap = {
  "RedPajama INCITE Base 3B": {
    description: dedent`
      Fine-tuned for few-shot applications on the data of GPT-JT, with exclusion of tasks that overlap with the HELM core scenarios.

      Developed by Together and leaders from the open-source AI community including Ontocord.ai, ETH DS3Lab, AAI CERC, Université de Montréal, MILA - Québec AI Institute, Stanford Center for Research on Foundation Models (CRFM), Stanford Hazy Research research group and LAION.

      Req: >=16GB of CPU.
    `,
    modelType: ModelType.NeoX,
    size: 2085535776,
    downloadUrl:
      "https://huggingface.co/rustformers/redpajama-3b-ggml/resolve/ef3021e148238890ceba93c9fe4e17d49d8b279b/RedPajama-INCITE-Base-3B-v1-q5_1-ggjt.bin",
    blake3: "e7d8010b8dabf3ebeb3ecd4fba9c5167fa8fae17a41d83659401f9de4a2026c5",
    sha256: "889535a92e45e8e120289c53768688facbdec00f2f97ee269660679bfaffd99d",
    licenses: [...commonLicenses],
    citations: [...commonCitations]
  },
  "RedPajama INCITE Instruct 3B": {
    description: dedent`
      RedPajama fine-tuned for Instruction-following.
      
      Req: >=16GB of CPU.
    `,
    modelType: ModelType.NeoX,
    size: 5148350464,
    downloadUrl:
      "https://huggingface.co/rustformers/redpajama-3b-ggml/resolve/ef3021e148238890ceba93c9fe4e17d49d8b279b/RedPajama-INCITE-Instruct-3B-v1-q5_1-ggjt.bin",
    blake3: "5c302b966b13fb314d62b6d8dea9b9e237ae1fa71be5b3f51b83935218685734",
    sha256: "30d002d29e2e2ae942ff600d69012062af85e203e8f1f0d7e1133ad96f6ea354",
    licenses: [...commonLicenses],
    citations: [...commonCitations]
  },
  "RedPajama INCITE Chat 3B": {
    description: dedent`
      RedPajama fine-tuned for Chat conversation.
      
      Req: >=16GB of CPU.
    `,
    modelType: ModelType.NeoX,
    size: 5148350464,
    downloadUrl:
      "https://huggingface.co/rustformers/redpajama-3b-ggml/resolve/ef3021e148238890ceba93c9fe4e17d49d8b279b/RedPajama-INCITE-Instruct-3B-v1-q5_1-ggjt.bin",
    blake3: "5c302b966b13fb314d62b6d8dea9b9e237ae1fa71be5b3f51b83935218685734",
    sha256: "30d002d29e2e2ae942ff600d69012062af85e203e8f1f0d7e1133ad96f6ea354",
    licenses: [...commonLicenses],
    citations: [...commonCitations]
  }
}
