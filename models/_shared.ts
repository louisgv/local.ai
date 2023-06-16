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
  Commercial = "Commercial",
  NonCommercial = "Non-commercial",
  Academic = "Academic",
  OpenSource = "Open-source",
  BigScience = "BigScience RAIL License v1.0",
  MIT = "MIT",
  Apache2 = "Apache-2.0",
  GPL = "GPL"
}

export type ModelInfo = {
  name?: string
  size: number
  downloadUrl: string
  sha256: string
  blake3: string
  description: string
  licenses: (LicenseType | string)[]
  modelType: ModelType
  tokenizers?: string[]
  tags?: string[]
  citations?: string[]
  disabled?: boolean

  promptTemplate?: string
}

export type ModelMap = Record<string, ModelInfo>

export const toList = (modelMap: ModelMap) =>
  Object.entries(modelMap)
    .map(([name, model]) => ({
      ...model,
      name
    }))
    .filter((model) => !model.disabled)
