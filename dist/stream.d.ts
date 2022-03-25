import { Index, Methodology } from "./types";
export declare type StreamIndexOptions = {
    methodology: "MFIV";
    timePeriod: string | "14D";
    asset: "ETH";
    idleTimeout?: number;
    withDisconnects?: false;
    onError?: (error: Error) => void;
    apiKey?: string;
};
export declare type RealtimeVolatilityOptions<U extends boolean = false> = {
    methodology: Methodology;
    timePeriod: string;
    asset: "ETH";
    apiKey?: string;
    idleTimeout?: number;
    withDisconnects?: U;
    onError?: (error: Error) => void;
};
export declare function realtimeVolatility({ methodology, timePeriod, asset, apiKey, idleTimeout, withDisconnects, onError, }: RealtimeVolatilityOptions<false>): AsyncIterableIterator<Index>;
//# sourceMappingURL=stream.d.ts.map