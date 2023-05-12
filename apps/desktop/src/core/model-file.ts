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
