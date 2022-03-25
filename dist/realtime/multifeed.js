"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiplexBase = void 0;
const stream_1 = require("stream");
class MultiplexBase {
    constructor(_methodology, _timePeriod, _asset, _idleTimeout, _apiKey, _onError) {
        this._methodology = _methodology;
        this._timePeriod = _timePeriod;
        this._asset = _asset;
        this._idleTimeout = _idleTimeout;
        this._apiKey = _apiKey;
        this._onError = _onError;
    }
    [Symbol.asyncIterator]() {
        return this._stream();
    }
    async *_stream() {
        const combinedStream = new stream_1.PassThrough({
            objectMode: true,
            highWaterMark: 8096,
        });
        const realTimeFeeds = this._getRealTimeFeeds(this._methodology, this._timePeriod, this._asset, this._idleTimeout, this._onError, this._apiKey);
        for (const realTimeFeed of realTimeFeeds) {
            // iterate over separate real-time feeds and write their messages into combined stream
            ;
            (async function writeMessagesToCombinedStream() {
                for await (const message of realTimeFeed) {
                    if (combinedStream.destroyed) {
                        return;
                    }
                    if (!combinedStream.write(message))
                        // Handle backpressure on write
                        await (0, stream_1.once)(combinedStream, "drain");
                }
            })();
        }
        for await (const message of combinedStream) {
            yield message;
        }
    }
}
exports.MultiplexBase = MultiplexBase;
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
//# sourceMappingURL=multifeed.js.map