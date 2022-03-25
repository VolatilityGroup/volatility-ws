import { Asset, Methodology, Subscription } from "../types";
import { MultiplexBase } from "./multifeed";
import { RealTimeBase } from "./realtimefeed";
export declare class RealTimeMfiv extends MultiplexBase {
    wssURL: string;
    protected _getRealTimeFeeds(methodology: Methodology, timePeriod: string, asset: Asset, idleTimeout?: number, onError?: (error: Error) => void, apiKey?: string): Generator<RealTimeMfivStream, void, unknown>;
}
export declare class RealTimeMfivStream extends RealTimeBase {
    protected wssURL: string;
    constructor(methodology: Methodology, timePeriod: string, asset: Asset, wssURL: string, idleTimeout: number | undefined, onError?: (error: Error) => void, apiKey?: string);
    protected buildSubscribe(): Subscription[];
    protected isHeartbeat(msg: any): boolean;
    protected isError(message: any): boolean;
}
//# sourceMappingURL=mfiv.d.ts.map