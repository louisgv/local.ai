import { useReducer, useState } from "react"

type CompletionRequest = {
  prompt: string

  seed?: number
  max_tokens?: number
  temperature?: number
  top_p?: number
  stream: boolean

  stop?: string | string[] | null
  presence_penalty?: number
  frequency_penalty?: number

  // n: number
  // best_of: number
  // logprobs: number | null
  // logit_bias: Record<string, number>
}

// export const useCompletionParams = () => {
//   const [maxTokens, setMaxTokens] = useReducer(()=> {

//   }, {

//   })
//   const [temperature, setTemperature] = useState(0)
//   const [topP, setTopP] = useState(1)
//   const [seed, setSeed] = useState(0)
//   const [frequencyPenalty, setFrequencyPenalty] = useState(0)
//   const [presencePenalty, setPresencePenalty] = useState(0)
//   const [stopSequence, setStopSequence] = useState("")
// }
