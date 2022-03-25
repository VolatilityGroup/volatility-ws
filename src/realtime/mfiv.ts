import { C } from "../consts"
import { Asset, Methodology, Subscription } from "../types"
import { MultiplexBase } from "./multifeed"
import { RealTimeBase } from "./realtimefeed"

export class RealTimeMfiv extends MultiplexBase {
  wssURL = "wss://ws.prd.volatility.com:8443/ws"

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

export class RealTimeMfivStream extends RealTimeBase {
  constructor(
    methodology: Methodology,
    timePeriod: string,
    asset: Asset,
    protected wssURL: string,
    idleTimeout: number | undefined,
    onError?: (error: Error) => void,
    apiKey?: string
  ) {
    super(methodology, timePeriod, asset, idleTimeout, onError, apiKey)
  }

  protected buildSubscribe(): Subscription[] {
    return [
      {
        type: "SUBSCRIBE",
        channel: `${this._methodology}/${this._timePeriod}/${this._asset}`,
      },
    ]
  }

  protected isHeartbeat(msg: any): boolean {
    if (msg === C.HEARTBEAT) {
      return true
    }

    return super.isHeartbeat(msg)
  }

  protected isError(message: any): boolean {
    if (message.error !== undefined) {
      return true
    }

    return false
  }
}
