import { Methodology, Asset } from "../types";
import { MultiplexBase } from "./multifeed";
import { RealTimeMfiv, RealTimeMfivStream } from "./mfiv";
export * from "./realtimefeed";
export declare function createRealTimeFeed(methodology: Methodology, timePeriod: string, asset: Asset, idleTimeout: number | undefined, onError?: (error: Error) => void, apiKey?: string): RealTimeMfiv;
export declare abstract class RealTimeBase extends MultiplexBase {
    protected abstract wssURL: string;
    protected abstract suffixes: {
        [key: string]: string;
    };
    protected _getRealTimeFeeds(methodology: Methodology, timePeriod: string, asset: Asset, idleTimeout?: number, onError?: (error: Error) => void, apiKey?: string): Generator<RealTimeMfivStream, void, unknown>;
}
//# sourceMappingURL=index.d.ts.map