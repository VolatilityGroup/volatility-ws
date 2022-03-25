/// <reference types="node" />
import https from "https";
import { Asset, Index, Methodology } from "./types";
export declare function wait(delayMS: number): Promise<unknown>;
export declare function normalizeId({ methodology, timePeriod, asset, }: {
    methodology: Methodology;
    timePeriod: string;
    asset: Asset;
}): string;
export declare const ONE_SEC_IN_MS = 1000;
export declare class HttpError extends Error {
    readonly status: number;
    readonly responseText: string;
    readonly url: string;
    constructor(status: number, responseText: string, url: string);
}
export declare function preprocess(methodology: Methodology, timePeriod: string, asset: Asset, messages: AsyncIterableIterator<{
    localTimestamp: Date;
    message: Index;
}>, withDisconnectMessages: boolean | undefined, currentTimestamp?: Date | undefined): AsyncGenerator<any, void, unknown>;
export declare const httpsProxyAgent: https.Agent | undefined;
//# sourceMappingURL=utils.d.ts.map