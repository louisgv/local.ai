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
    size: 2086120640,
    tokenizers: ["togethercomputer/RedPajama-INCITE-Base-3B-v1"],
    downloadUrl:
      "https://huggingface.co/rustformers/redpajama-3b-ggml/resolve/ef3021e148238890ceba93c9fe4e17d49d8b279b/RedPajama-INCITE-Base-3B-v1-q5_1-ggjt.bin",
    blake3: "e7d8010b8dabf3ebeb3ecd4fba9c5167fa8fae17a41d83659401f9de4a2026c5",
    sha256: "2ec23403eef21c908fc215886cca6434b2aa8dd9ca727dc581e763eab14f667d",
    licenses: [...commonLicenses],
    citations: [...commonCitations]
  },
  "RedPajama INCITE Instruct 3B": {
    description: dedent`
      RedPajama fine-tuned for Instruction-following.
      
      Req: >=16GB of CPU.
    `,
    modelType: ModelType.NeoX,
    size: 2086120608,
    tokenizers: ["togethercomputer/RedPajama-INCITE-Instruct-3B-v1"],
    downloadUrl:
      "https://huggingface.co/rustformers/redpajama-3b-ggml/resolve/ef3021e148238890ceba93c9fe4e17d49d8b279b/RedPajama-INCITE-Instruct-3B-v1-q5_1-ggjt.bin",
    blake3: "f20f7e84836320896d3a81ad52a1ba00a90ca884b2932cf170b4be049f80aea5",
    sha256: "74c2dc835883f58fb2d1f67c8d038772b7cc5456420632724b294415fb1f3b37",
    licenses: [...commonLicenses],
    citations: [...commonCitations]
  },
  "RedPajama INCITE Chat 3B": {
    description: dedent`
      RedPajama fine-tuned for Chat conversation.
      
      Req: >=16GB of CPU.
    `,
    modelType: ModelType.NeoX,
    size: 2086120608,
    tokenizers: ["togethercomputer/RedPajama-INCITE-Chat-3B-v1"],
    downloadUrl:
      "https://huggingface.co/rustformers/redpajama-3b-ggml/resolve/ef3021e148238890ceba93c9fe4e17d49d8b279b/RedPajama-INCITE-Chat-3B-v1-q5_1-ggjt.bin",
    blake3: "03659698bb4b4902f9c55275a46373fb4a00c616b04a1440f4d04e23bba659d9",
    sha256: "5943bc928dcaafb6e0155e5517ce00a4ae75e117b9e4e03e1575a24e883d040a",
    licenses: [...commonLicenses],
    citations: [...commonCitations]
  }
}
