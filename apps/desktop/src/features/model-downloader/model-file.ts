export type FileInfo = {
  name: string
  path: string
  size?: number
  modified?: any
}

export type ModelMetadata = FileInfo & {
  digest?: string
  label?: string
  description?: string
}

export type DirectoryState = {
  path: string
  files: FileInfo[]
}

export function toGB(size: number) {
  return size / 1024 / 1024 / 1024
}
