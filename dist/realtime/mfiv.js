"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeMfivStream = exports.RealTimeMfiv = void 0;
const consts_1 = require("../consts");
const multifeed_1 = require("./multifeed");
const realtimefeed_1 = require("./realtimefeed");
class RealTimeMfiv extends multifeed_1.MultiplexBase {
    constructor() {
        super(...arguments);
        this.wssURL = "wss://ws.prd.volatility.com:8443/ws";
    }
    *_getRealTimeFeeds(methodology, timePeriod, asset, idleTimeout, onError, apiKey) {
        yield new RealTimeMfivStream(methodology, timePeriod, asset, this.wssURL, idleTimeout, onError, apiKey);
    }
}
exports.RealTimeMfiv = RealTimeMfiv;
class RealTimeMfivStream extends realtimefeed_1.RealTimeBase {
    constructor(methodology, timePeriod, asset, wssURL, idleTimeout, onError, apiKey) {
        super(methodology, timePeriod, asset, idleTimeout, onError, apiKey);
        this.wssURL = wssURL;
    }
    buildSubscribe() {
        return [
            {
                type: "SUBSCRIBE",
                channel: `${this._methodology}/${this._timePeriod}/${this._asset}`,
            },
        ];
    }
    isHeartbeat(msg) {
        if (msg === consts_1.C.HEARTBEAT) {
            return true;
        }
        return super.isHeartbeat(msg);
    }
    isError(message) {
        if (message.error !== undefined) {
            return true;
        }
        return false;
    }
}
exports.RealTimeMfivStream = RealTimeMfivStream;
//# sourceMappingURL=mfiv.js.map