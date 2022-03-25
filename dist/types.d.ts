import { ASSETS, METHODOLOGIES } from "./consts";
export declare type Methodology = typeof METHODOLOGIES[number];
export declare type Asset = typeof ASSETS[number];
export declare type Index = {
    readonly type: "index";
    readonly id: string | undefined;
    readonly symbols: string[];
    readonly dVol: number;
    readonly invdVol: number;
    readonly value: number;
    readonly underlyingPrice: number;
    readonly methodology: Methodology;
    readonly timePeriod: string;
    readonly asset: Asset;
    readonly risklessRate: number;
    readonly risklessRateAt: Date;
    readonly risklessRateSource: string;
    readonly timestamp: Date;
    readonly localTimestamp: Date;
};
export declare type Disconnect = {
    readonly type: "disconnect";
    readonly id: string;
    readonly localTimestamp: Date;
};
export declare type Subscription = {
    type: "SUBSCRIBE";
    channel: string;
};
//# sourceMappingURL=types.d.ts.map