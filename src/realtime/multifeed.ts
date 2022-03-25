import { once, PassThrough } from "stream"
import { Asset, Methodology } from "../types"
import { RealTimeFeedIterable } from "./realtimefeed"

export abstract class MultiplexBase implements RealTimeFeedIterable {
  constructor(
    private readonly _methodology: Methodology,
    private readonly _timePeriod: string,
    private readonly _asset: Asset,
    private readonly _idleTimeout: number | undefined,
    private readonly _apiKey?: string,
    private readonly _onError?: (error: Error) => void
  ) {}

  [Symbol.asyncIterator]() {
    return this._stream()
  }

  private async *_stream() {
    const combinedStream = new PassThrough({
      objectMode: true,
      highWaterMark: 8096,
    })

    const realTimeFeeds = this._getRealTimeFeeds(
      this._methodology,
      this._timePeriod,
      this._asset,
      this._idleTimeout,
      this._onError,
      this._apiKey
    )

    for (const realTimeFeed of realTimeFeeds) {
      // iterate over separate real-time feeds and write their messages into combined stream
      ;(async function writeMessagesToCombinedStream() {
        for await (const message of realTimeFeed) {
          if (combinedStream.destroyed) {
            return
          }

          if (!combinedStream.write(message))
            // Handle backpressure on write
            await once(combinedStream, "drain")
        }
      })()
    }

    for await (const message of combinedStream) {
      yield message
    }
  }

  protected abstract _getRealTimeFeeds(
    methodology: Methodology,
    timePeriod: string,
    asset: Asset,
    idleTimeout?: number,
    onError?: (error: Error) => void,
    apiKey?: string
  ): IterableIterator<RealTimeFeedIterable>
}

// export abstract class PoolingClientBase implements RealTimeFeedIterable {
//   protected readonly debug: dbg.Debugger
//   private _tid: NodeJS.Timeout | undefined = undefined
//   constructor(
//     exchange: string,
//     private readonly _poolingIntervalSeconds: number
//   ) {
//     this.debug = dbg(`volatility-ws:pooling-client:${exchange}`)
//   }

//   [Symbol.asyncIterator]() {
//     return this._stream()
//   }

//   protected abstract poolDataToStream(outputStream: Writable): Promise<void>

//   private async _startPooling(outputStream: Writable) {
//     const timeoutInterval = this._poolingIntervalSeconds * ONE_SEC_IN_MS

//     const pool = async () => {
//       try {
//         await this.poolDataToStream(outputStream)
//       } catch (e) {
//         this.debug("pooling error %o", e)
//       }
//     }

//     const poolAndSchedule = () => {
//       pool().then(() => {
//         if (!outputStream.destroyed) {
//           this._tid = setTimeout(poolAndSchedule, timeoutInterval)
//         }
//       })
//     }
//     poolAndSchedule()
//   }

//   private async *_stream() {
//     const stream = new PassThrough({
//       objectMode: true,
//       highWaterMark: 1024,
//     })

//     this._startPooling(stream)

//     this.debug("pooling started")

//     try {
//       for await (const message of stream) {
//         yield message
//       }
//     } finally {
//       if (this._tid !== undefined) {
//         clearInterval(this._tid)
//       }

//       this.debug("pooling finished")
//     }
//   }
// }
