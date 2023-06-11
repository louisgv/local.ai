import type { InvokeCommand, InvokeIO } from "~features/invoke/_shared"

export type ModelIntegrity = {
  sha256: string
  blake3: string
}

export type ModelIntegrityCommandMap = {
  [InvokeCommand.GetCachedIntegrity]: InvokeIO<{ path: string }, ModelIntegrity>
  [InvokeCommand.ComputeModelIntegrity]: InvokeIO<
    { path: string },
    ModelIntegrity
  >
}
