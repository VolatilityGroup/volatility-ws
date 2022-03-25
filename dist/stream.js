"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeVolatility = void 0;
const debug_1 = require("./debug");
const utils_1 = require("./utils");
const realtime_1 = require("./realtime");
async function* _stream({ methodology, timePeriod, asset, idleTimeout = 30000, withDisconnects = undefined, onError = undefined, apiKey = undefined, }) {
    const realTimeFeed = (0, realtime_1.createRealTimeFeed)(methodology, timePeriod, asset, idleTimeout, onError, apiKey);
    for await (const message of realTimeFeed) {
        if (message._disconnect === true) {
            if (withDisconnects) {
                yield undefined;
            }
        }
        else {
            yield {
                localTimestamp: new Date(),
                message,
            };
        }
    }
}
async function* _streamIndex({ methodology, timePeriod, asset, apiKey, idleTimeout = 30000, withDisconnects = undefined, onError = undefined, }) {
    const id = (0, utils_1.normalizeId)({ methodology, timePeriod, asset });
    while (true) {
        try {
            const messages = _stream({
                methodology,
                timePeriod,
                asset,
                withDisconnects,
                idleTimeout,
                onError,
                apiKey,
            });
            const normalizedMessages = (0, utils_1.preprocess)(methodology, timePeriod, asset, messages, withDisconnects, new Date());
            for await (const message of normalizedMessages) {
                yield {
                    ...message.message.data,
                    localTimestamp: message.localTimestamp,
                };
            }
        }
        catch (error) {
            if (onError !== undefined) {
                onError(error);
            }
            (0, debug_1.debug)("%s index messages error: %o, retrying with new connection...", id, error);
            if (withDisconnects) {
                const disconnect = {
                    type: "disconnect",
                    id,
                    localTimestamp: new Date(),
                };
                yield disconnect;
            }
        }
    }
}
function realtimeVolatility({ methodology, timePeriod, asset, apiKey, idleTimeout = 30000, withDisconnects = undefined, onError = undefined, }) {
    (0, debug_1.debug)(`methodology: ${methodology}\ntimePeriod: ${timePeriod}\nasset: ${asset}\napiKey: ${apiKey}`);
    const _iterator = _streamIndex({
        methodology,
        timePeriod,
        asset,
        idleTimeout,
        withDisconnects,
        onError,
        apiKey,
    });
    _iterator.__realtime__ = true;
    return _iterator;
}
exports.realtimeVolatility = realtimeVolatility;
//# sourceMappingURL=stream.js.map