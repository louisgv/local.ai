import { FloatInput } from "@localai/ui/float-input"
import { Input } from "@localai/ui/input"
import { Textarea } from "@localai/ui/textarea"
import { TokenInput } from "@localai/ui/token-input"

import {
  DEFAULT_PROMPT_TEMPLATE,
  DEFAULT_THREAD_CONFIG
} from "~features/thread/_shared"
import { useThread } from "~providers/thread"

export const ThreadConfigPanel = () => {
  const { threadConfig, setCompletionParams } = useThread()
  return (
    <>
      <Textarea
        rows={8}
        title="Prompt template"
        value={threadConfig.data.promptTemplate}
        onChange={(e) =>
          threadConfig.update({
            promptTemplate: e.target.value
          })
        }
        onRevert={() => {
          threadConfig.update({
            promptTemplate: DEFAULT_PROMPT_TEMPLATE
          })
        }}
      />

      <FloatInput
        placeholder="Temperature"
        value={threadConfig.data.completionParams.temperature}
        onDone={(v) =>
          setCompletionParams({
            temperature: v
          })
        }
        onRevert={() => {
          setCompletionParams({
            temperature: DEFAULT_THREAD_CONFIG.completionParams.temperature
          })
        }}
      />

      <FloatInput
        placeholder="Top P"
        value={threadConfig.data.completionParams.top_p}
        onDone={(v) =>
          setCompletionParams({
            top_p: v
          })
        }
        onRevert={() => {
          setCompletionParams({
            top_p: DEFAULT_THREAD_CONFIG.completionParams.top_p
          })
        }}
      />

      <FloatInput
        placeholder="Frequency Penalty"
        value={threadConfig.data.completionParams.frequency_penalty}
        onDone={(v) =>
          setCompletionParams({
            frequency_penalty: v
          })
        }
        onRevert={() => {
          setCompletionParams({
            frequency_penalty:
              DEFAULT_THREAD_CONFIG.completionParams.frequency_penalty
          })
        }}
      />

      <FloatInput
        placeholder="Presence Penalty"
        value={threadConfig.data.completionParams.presence_penalty}
        onDone={(v) =>
          setCompletionParams({
            presence_penalty: v
          })
        }
        onRevert={() => {
          setCompletionParams({
            presence_penalty:
              DEFAULT_THREAD_CONFIG.completionParams.presence_penalty
          })
        }}
      />

      <TokenInput
        placeholder="Stop Squences"
        value={threadConfig.data.completionParams.stop || []}
        onDone={(v) =>
          setCompletionParams({
            stop: v
          })
        }
        onRevert={() => {
          setCompletionParams({
            stop: DEFAULT_THREAD_CONFIG.completionParams.stop
          })
        }}
      />

      <Input
        placeholder="Max Tokens (0 is INF)"
        value={threadConfig.data.completionParams.max_tokens}
        min={0}
        type="number"
        onChange={(e) =>
          setCompletionParams({
            max_tokens: e.target.valueAsNumber
          })
        }
        onRevert={() => {
          setCompletionParams({
            max_tokens: DEFAULT_THREAD_CONFIG.completionParams.max_tokens
          })
        }}
      />

      <Input
        placeholder="Seed"
        value={threadConfig.data.completionParams.seed}
        min={0}
        type="number"
        onChange={(e) =>
          setCompletionParams({
            seed: e.target.valueAsNumber
          })
        }
        onRevert={() => {
          setCompletionParams({
            seed: DEFAULT_THREAD_CONFIG.completionParams.seed
          })
        }}
      />

      <Input
        placeholder="Top K"
        value={threadConfig.data.completionParams.top_k}
        min={0}
        type="number"
        onChange={(e) =>
          setCompletionParams({
            top_k: e.target.valueAsNumber
          })
        }
        onRevert={() => {
          setCompletionParams({
            top_k: DEFAULT_THREAD_CONFIG.completionParams.top_k
          })
        }}
      />
    </>
  )
}
