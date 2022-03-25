import { Asset, Methodology } from "../types";
import { RealTimeFeedIterable } from "./realtimefeed";
export declare abstract class MultiplexBase implements RealTimeFeedIterable {
    private readonly _methodology;
    private readonly _timePeriod;
    private readonly _asset;
    private readonly _idleTimeout;
    private readonly _apiKey?;
    private readonly _onError?;
    constructor(_methodology: Methodology, _timePeriod: string, _asset: Asset, _idleTimeout: number | undefined, _apiKey?: string | undefined, _onError?: ((error: Error) => void) | undefined);
    [Symbol.asyncIterator](): AsyncGenerator<any, void, unknown>;
    private _stream;
    protected abstract _getRealTimeFeeds(methodology: Methodology, timePeriod: string, asset: Asset, idleTimeout?: number, onError?: (error: Error) => void, apiKey?: string): IterableIterator<RealTimeFeedIterable>;
}
//# sourceMappingURL=multifeed.d.ts.map