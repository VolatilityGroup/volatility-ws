import { debug } from "./debug"
import { normalizeId, preprocess } from "./utils"
import { createRealTimeFeed } from "./realtime"
import { Disconnect, Index, Methodology } from "./types"

async function* _stream<U extends boolean = false>({
  methodology,
  timePeriod,
  asset,
  idleTimeout = 30000,
  withDisconnects = undefined,
  onError = undefined,
  apiKey = undefined,
}: StreamIndexOptions): AsyncIterableIterator<
  U extends true
    ? { localTimestamp: Date; message: any } | undefined
    : { localTimestamp: Date; message: any }
> {
  const realTimeFeed = createRealTimeFeed(
    methodology,
    timePeriod,
    asset,
    idleTimeout,
    onError,
    apiKey
  )

  for await (const message of realTimeFeed) {
    if (message._disconnect === true) {
      if (withDisconnects) {
        yield undefined as any
      }
    } else {
      yield {
        localTimestamp: new Date(),
        message,
      } as any
    }
  }
}

async function* _streamIndex({
  methodology,
  timePeriod,
  asset,
  apiKey,
  idleTimeout = 30000,
  withDisconnects = undefined,
  onError = undefined,
}: StreamIndexOptions): AsyncIterableIterator<Index> {
  const id: string = normalizeId({ methodology, timePeriod, asset })

  while (true) {
    try {
      const messages = _stream({
        methodology,
        timePeriod,
        asset,
        withDisconnects,
        idleTimeout,
        onError,
        apiKey,
      })

      const normalizedMessages = preprocess(
        methodology,
        timePeriod,
        asset,
        messages,
        withDisconnects,
        new Date()
      )

      for await (const message of normalizedMessages) {
        yield {
          ...message.message.data,
          localTimestamp: message.localTimestamp,
        }
      }
    } catch (error: any) {
      if (onError !== undefined) {
        onError(error)
      }
      debug(
        "%s index messages error: %o, retrying with new connection...",
        id,
        error
      )

      if (withDisconnects) {
        const disconnect: Disconnect = {
          type: "disconnect",
          id,
          localTimestamp: new Date(),
        }

        yield disconnect as any
      }
    }
  }
}

export type StreamIndexOptions = {
  methodology: "MFIV"
  timePeriod: string | "14D"
  asset: "ETH"
  idleTimeout?: number
  withDisconnects?: false
  onError?: (error: Error) => void
  apiKey?: string
}

export type RealtimeVolatilityOptions<U extends boolean = false> = {
  methodology: Methodology
  timePeriod: string
  asset: "ETH"
  apiKey?: string
  idleTimeout?: number
  withDisconnects?: U
  onError?: (error: Error) => void
}

export function realtimeVolatility({
  methodology,
  timePeriod,
  asset,
  apiKey,
  idleTimeout = 30000,
  withDisconnects = undefined,
  onError = undefined,
}: RealtimeVolatilityOptions<false>) {
  debug(
    `methodology: ${methodology}\ntimePeriod: ${timePeriod}\nasset: ${asset}\napiKey: ${apiKey}`
  )

  const _iterator = _streamIndex({
    methodology,
    timePeriod,
    asset,
    idleTimeout,
    withDisconnects,
    onError,
    apiKey,
  })

  ;(_iterator as any).__realtime__ = true

  return _iterator
}
