import { FloatInput } from "@localai/ui/float-input"
import { Input } from "@localai/ui/input"
import { Textarea } from "@localai/ui/textarea"
import { TokenInput } from "@localai/ui/token-input"
import { useMemo } from "react"

import type { CompletionRequest } from "~features/invoke/thread"
import {
  DEFAULT_PROMPT_TEMPLATE,
  DEFAULT_THREAD_CONFIG
} from "~features/thread/_shared"
import { useThread } from "~providers/thread"

type ConfigInputProps = {
  type: "float" | "number" | "text" | "token"
  placeholder: string
  configKey: keyof CompletionRequest
}

const ConfigInput = ({ type, placeholder, configKey }: ConfigInputProps) => {
  const { threadConfig, setCompletionParams } = useThread()
  return useMemo(() => {
    const value = threadConfig.data.completionParams[configKey] as any

    const onDone = (v: any) =>
      setCompletionParams({
        [configKey]: v
      })

    const revert = () => {
      setCompletionParams({
        [configKey]: DEFAULT_THREAD_CONFIG.completionParams[configKey]
      })
    }

    switch (type) {
      case "token": {
        return (
          <TokenInput
            value={value || []}
            placeholder={placeholder}
            onDone={onDone}
            onRevert={revert}
          />
        )
      }
      case "float": {
        return (
          <FloatInput
            value={value}
            placeholder={placeholder}
            onDone={onDone}
            onRevert={revert}
          />
        )
      }
      default: {
        const isNumber = type === "number"
        const extraProps = isNumber ? { min: 0, type } : {}
        return (
          <Input
            value={value}
            placeholder={placeholder}
            onChange={(e) =>
              onDone(isNumber ? e.target.valueAsNumber : e.target.value)
            }
            onRevert={revert}
            {...extraProps}
          />
        )
      }
    }
  }, [type, threadConfig, configKey, placeholder, setCompletionParams])
}

export const ThreadConfigPanel = () => {
  const { threadConfig } = useThread()
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

      <ConfigInput
        type="float"
        placeholder="Temperature"
        configKey="temperature"
      />

      <ConfigInput type="float" placeholder="Top P" configKey="top_p" />

      <ConfigInput
        type="float"
        placeholder="Frequency Penalty"
        configKey="frequency_penalty"
      />

      <ConfigInput
        type="float"
        placeholder="Presence Penalty"
        configKey="presence_penalty"
      />

      <ConfigInput type="token" placeholder="Stop Sequences" configKey="stop" />

      <ConfigInput
        type="number"
        placeholder="Max Tokens (0 is INF)"
        configKey="max_tokens"
      />

      <ConfigInput type="number" placeholder="Seed" configKey="seed" />

      <ConfigInput type="number" placeholder="Top K" configKey="top_k" />
    </>
  )
}
