import dedent from "ts-dedent"

import { LicenseType, type ModelMap, ModelType } from "./_shared"

const commonCitations = [
  "https://www.mosaicml.com/blog/mpt-7b",
  "https://huggingface.co/rustformers/mpt-7b-ggml"
]

export const mptModelMap: ModelMap = {
  "MPT 7B": {
    description: dedent`
      MPT-7B is a decoder-style transformer pretrained from scratch on 1T tokens of English text and code by MosaicML.
      
      Req: >=24GB of CPU.
    `,
    modelType: ModelType.Mpt,
    size: 4988559744,
    downloadUrl:
      "https://huggingface.co/rustformers/mpt-7b-ggml/resolve/af6801ddff2c20699582f9d6347c1b95321c50e3/mpt-7b-q5_1-ggjt.bin",
    blake3: "7e2d9fbee3507bf5dc1d35b1774a4cc3c36001c24e90d521c9d30ebd096201f2",
    sha256: "a2af24525130f923c54dad0eddac870d18982a939927f222a0aef1b9aaf92d78",
    licenses: [
      LicenseType.Commercial,
      LicenseType.OpenSource,
      LicenseType.Apache2
    ],
    tokenizers: ["mosaicml/mpt-7b"],
    citations: [...commonCitations, "https://huggingface.co/mosaicml/mpt-7b"]
  },
  "MPT 7B Instruct": {
    description: dedent`
      MPT fine-tuned for short-form instruction following.
      
      Req: >=24GB of CPU.
    `,
    modelType: ModelType.Mpt,
    size: 4988559712,
    downloadUrl:
      "https://huggingface.co/rustformers/mpt-7b-ggml/resolve/af6801ddff2c20699582f9d6347c1b95321c50e3/mpt-7b-instruct-q5_1-ggjt.bin",
    blake3: "2331ea1208288cd52bcaaae555f231f9a51a264f4b8548a7998da43573e6935a",
    sha256: "ab4825853856833ee2d9626c231079509d7f5f1f048e874b15ca9da263a01b13",
    tags: ["instruct"],
    tokenizers: ["mosaicml/mpt-7b-instruct"],
    licenses: [LicenseType.Commercial, LicenseType.OpenSource, "CC-By-SA-3.0"],
    citations: [
      ...commonCitations,
      "https://huggingface.co/mosaicml/mpt-7b-instruct"
    ]
  },
  "MPT 7B Chat": {
    description: dedent`
      MPT fine-tuned for dialogue generation.
      
      Req: >=24GB of CPU.
    `,
    modelType: ModelType.Mpt,
    size: 4988559744,
    downloadUrl:
      "https://huggingface.co/rustformers/mpt-7b-ggml/resolve/af6801ddff2c20699582f9d6347c1b95321c50e3/mpt-7b-chat-q5_1-ggjt.bin",
    blake3: "5e4f603682116735773b977d54dc74522da22f899c1609376be5e723782fdacd",
    sha256: "63b1e4ca828d00a808284fa50f5a02c31a536e79af18914549ce9bb85dfec3d7",
    tags: ["chat"],
    tokenizers: ["mosaicml/mpt-7b-chat"],
    licenses: [LicenseType.NonCommercial, "CC-By-NC-SA-4.0"],
    citations: [
      ...commonCitations,
      "https://huggingface.co/mosaicml/mpt-7b-chat"
    ]
  },
  "MPT 7B Storywriter": {
    description: dedent`
      A model designed to read and write fictional stories with super long output context lengths. 
      
      Req: >=24GB of CPU.

      (NOTE: This model is still under development, hence its output is pretty buggy).
    `,
    modelType: ModelType.Mpt,
    size: 4988356608,
    tokenizers: ["mosaicml/mpt-7b-storywriter"],
    downloadUrl:
      "https://huggingface.co/TheBloke/MPT-7B-Storywriter-GGML/resolve/8ba65dc5e6cd9f40317c9ec12a900f3b88f9d7ca/mpt-7b-storywriter.ggmlv3.q5_1.bin",
    blake3: "e8652cc6ff9faec96cba8a43ad966a9191fd954be3182bfd0e78e2fe45b55bbe",
    sha256: "3b7dd7aa7508cc8cb4e262fe4b93214826f38d18d04059075e05837457f54025",
    licenses: [
      LicenseType.Commercial,
      LicenseType.Apache2,
      LicenseType.OpenSource
    ],
    citations: [
      ...commonCitations,
      "https://huggingface.co/TheBloke/MPT-7B-Storywriter-GGML",
      "https://huggingface.co/mosaicml/mpt-7b-storywriter"
    ]
  }
}
