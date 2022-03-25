"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeBase = exports.createRealTimeFeed = void 0;
const multifeed_1 = require("./multifeed");
const mfiv_1 = require("./mfiv");
__exportStar(require("./realtimefeed"), exports);
function createRealTimeFeed(methodology, timePeriod, asset, idleTimeout, onError, apiKey) {
    return new mfiv_1.RealTimeMfiv(methodology, timePeriod, asset, idleTimeout, apiKey, onError);
}
exports.createRealTimeFeed = createRealTimeFeed;
class RealTimeBase extends multifeed_1.MultiplexBase {
    *_getRealTimeFeeds(methodology, timePeriod, asset, idleTimeout, onError, apiKey) {
        yield new mfiv_1.RealTimeMfivStream(methodology, timePeriod, asset, this.wssURL, idleTimeout, onError, apiKey);
    }
}
exports.RealTimeBase = RealTimeBase;
//# sourceMappingURL=index.js.map