export type FileInfo = {
  name: string
  size: number
  path: string
}

export type ModelMetadata = FileInfo & {
  hash?: string
  label?: string
  description?: string
}

export type ModelDirectoryState = {
  path: string
  files: FileInfo[]
}

export function toGB(size: number) {
  return size / 1024 / 1024 / 1024
}

export enum ModelType {
  Llama = "llama",
  GptJ = "gptj",
  Mpt = "mpt",
  NeoX = "gptneox",
  RedPajama = "redpajama",
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
