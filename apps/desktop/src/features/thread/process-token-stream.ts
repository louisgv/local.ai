// Define StreamResponse type here
interface StreamResponse {
  choices: Array<{ text: string }>
}

const SSE_DATA_EVENT_PREFIX = "data:"

export async function processSseStream(
  fetchStream: Response,
  abortRef: { current: boolean },
  onData: (resp: StreamResponse) => Promise<void>,
  onFinish: (isDone: boolean) => Promise<void>
) {
  const reader = fetchStream.body?.getReader()

  if (!reader) {
    return // If reader is not available
  }

  const decoder = new TextDecoder("utf-8")

  let readingBuffer = await reader.read()
  while (!readingBuffer.done && !abortRef.current) {
    try {
      const result =
        typeof readingBuffer.value === "string"
          ? readingBuffer.value
          : decoder.decode(readingBuffer.value, { stream: true })

      if (result?.startsWith(SSE_DATA_EVENT_PREFIX)) {
        const eventData = result.slice(SSE_DATA_EVENT_PREFIX.length).trim()

        await onData(JSON.parse(eventData))
      }
    } catch (_) {}

    readingBuffer = await reader.read()
  }

  await onFinish(readingBuffer.done)
  if (!readingBuffer.done) {
    await reader.cancel()
  }
}
