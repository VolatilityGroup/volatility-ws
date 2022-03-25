import { Methodology } from "./types";
export declare function init(initOptions?: Partial<Options>): void;
export declare function getOptions(): Readonly<Options>;
export declare type IndexOptions = {
    methodology: Methodology;
    timePeriod: "14D";
    asset: "ETH" | "BTC";
};
declare type Options = {
    endpoint: string;
    apiKey: string;
    _userAgent: string;
};
export {};
//# sourceMappingURL=options.d.ts.map