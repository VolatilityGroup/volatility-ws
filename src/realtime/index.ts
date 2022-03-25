import { Method } from "got/dist/source"
import { Methodology, Asset } from "../types"
import { MultiplexBase } from "./multifeed"
import { RealTimeMfiv, RealTimeMfivStream } from "./mfiv"
export * from "./realtimefeed"

export function createRealTimeFeed(
  methodology: Methodology,
  timePeriod: string,
  asset: Asset,
  idleTimeout: number | undefined,
  onError?: (error: Error) => void,
  apiKey?: string
) {
  return new RealTimeMfiv(
    methodology,
    timePeriod,
    asset,
    idleTimeout,
    apiKey,
    onError
  )
}

export abstract class RealTimeBase extends MultiplexBase {
  protected abstract wssURL: string
  protected abstract suffixes: { [key: string]: string }

  protected *_getRealTimeFeeds(
    methodology: Methodology,
    timePeriod: string,
    asset: Asset,
    idleTimeout?: number,
    onError?: (error: Error) => void,
    apiKey?: string
  ) {
    yield new RealTimeMfivStream(
      methodology,
      timePeriod,
      asset,
      this.wssURL,
      idleTimeout,
      onError,
      apiKey
    )
  }
}
