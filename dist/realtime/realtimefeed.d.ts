/// <reference types="node" />
import dbg from "debug";
import { Asset, Methodology, Subscription } from "../types";
export declare type RealTimeFeed = {
    new (methodology: Methodology, timePeriod: string, asset: Asset, idleTimeout: number | undefined, onError?: (error: Error) => void, apiKey?: string): RealTimeFeedIterable;
};
export declare type RealTimeFeedIterable = AsyncIterable<any>;
export declare abstract class RealTimeBase implements RealTimeFeedIterable {
    protected readonly _methodology: Methodology;
    protected readonly _timePeriod: string;
    protected readonly _asset: Asset;
    private readonly _idleTimeout;
    private readonly _onError?;
    private readonly _apiKey?;
    [Symbol.asyncIterator](): AsyncGenerator<any, void, unknown>;
    protected readonly debug: dbg.Debugger;
    protected abstract readonly wssURL: string;
    protected readonly ratelimit: number;
    private _receivedMessagesCount;
    private _ws?;
    private _connectionId;
    private _wsClientOptions;
    constructor(_methodology: Methodology, _timePeriod: string, _asset: Asset, _idleTimeout: number | undefined, _onError?: ((error: Error) => void) | undefined, _apiKey?: string | undefined);
    private _stream;
    protected send(msg: any): void;
    protected abstract buildSubscribe(): Subscription[];
    protected abstract isError(message: any): boolean;
    protected isHeartbeat(_msg: any): boolean;
    protected onMessage(_msg: any): void;
    protected onConnected(): void;
    protected decompress?: (msg: any) => Buffer;
    private _monitorConnectionIfStale;
    private pingTimer;
    private _onConnectionEstabilished;
    private _onConnectionClosed;
}
//# sourceMappingURL=realtimefeed.d.ts.map