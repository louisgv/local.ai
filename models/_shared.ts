export enum ModelType {
  Llama = "llama",
  Mpt = "mpt",
  GptJ = "gptj",
  NeoX = "gptneox",
  Bloom = "bloom",
  Gpt2 = "gpt2"
}

export const modelTypeList = Object.values(ModelType)

export enum LicenseType {
  Commercial = "commercial",
  NonCommercial = "non-commercial",
  Academic = "academic",
  OpenSource = "open-source",
  Apache2 = "apache-2.0"
}

export type ModelDownloadInfo = {
  name?: string
  downloadUrl: string
  sha256: string
  blake3: string
  description: string
  licenses: (LicenseType | string)[]
  modelType: ModelType
  vocabulary?: string[]
  tags?: string[]
  citation?: string[]
}

export type ModelMap = Record<string, ModelDownloadInfo>

export const toList = (modelMap: ModelMap) =>
  Object.entries(modelMap).map(([name, model]) => ({
    ...model,
    name
  }))
