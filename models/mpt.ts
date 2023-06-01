import { LicenseType, type ModelMap, ModelType } from "./_shared"

const commonCitations = [
  "https://www.mosaicml.com/blog/mpt-7b",
  "https://huggingface.co/rustformers/mpt-7b-ggml"
]

export const mptModelMap: ModelMap = {
  "MPT 7B": {
    description:
      "MPT-7B is a decoder-style transformer pretrained from scratch on 1T tokens of English text and code by MosaicML.",
    modelType: ModelType.Mpt,
    downloadUrl:
      "https://huggingface.co/rustformers/mpt-7b-ggml/resolve/main/mpt-7b-q5_1-ggjt.bin",
    blake3: "7e2d9fbee3507bf5dc1d35b1774a4cc3c36001c24e90d521c9d30ebd096201f2",
    sha256: "a2af24525130f923c54dad0eddac870d18982a939927f222a0aef1b9aaf92d78",
    licenses: [
      LicenseType.Commercial,
      LicenseType.OpenSource,
      LicenseType.Apache2
    ],
    citations: [...commonCitations, "https://huggingface.co/mosaicml/mpt-7b"]
  },
  "MPT 7B Instruct": {
    description:
      "MPT-7B-Instruct is a model for short-form instruction following trained by MosaicML.",
    modelType: ModelType.Mpt,
    downloadUrl:
      "https://huggingface.co/rustformers/mpt-7b-ggml/resolve/main/mpt-7b-instruct-q5_1-ggjt.bin",
    blake3: "2331ea1208288cd52bcaaae555f231f9a51a264f4b8548a7998da43573e6935a",
    sha256: "ab4825853856833ee2d9626c231079509d7f5f1f048e874b15ca9da263a01b13",
    tags: ["instruct"],
    licenses: [LicenseType.Commercial, LicenseType.OpenSource, "CC-By-SA-3.0"],
    citations: [
      ...commonCitations,
      "https://huggingface.co/mosaicml/mpt-7b-instruct"
    ]
  },
  "MPT 7B Chat": {
    description:
      "MPT-7B-Chat is a chatbot-like model for dialogue generation trained by MosaicML.",
    modelType: ModelType.Mpt,
    downloadUrl:
      "https://huggingface.co/rustformers/mpt-7b-ggml/resolve/main/mpt-7b-chat-q5_1-ggjt.bin",
    blake3: "5e4f603682116735773b977d54dc74522da22f899c1609376be5e723782fdacd",
    sha256: "63b1e4ca828d00a808284fa50f5a02c31a536e79af18914549ce9bb85dfec3d7",
    tags: ["chat"],
    licenses: [LicenseType.NonCommercial, "CC-By-NC-SA-4.0"],
    citations: [
      ...commonCitations,
      "https://huggingface.co/mosaicml/mpt-7b-chat"
    ]
  }
}
