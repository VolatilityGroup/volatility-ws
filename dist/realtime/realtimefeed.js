"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeBase = void 0;
const debug_1 = __importDefault(require("debug"));
const ws_1 = __importDefault(require("ws"));
const utils_1 = require("../utils");
let connectionCounter = 1;
class RealTimeBase {
    constructor(_methodology, _timePeriod, _asset, _idleTimeout, _onError, _apiKey) {
        this._methodology = _methodology;
        this._timePeriod = _timePeriod;
        this._asset = _asset;
        this._idleTimeout = _idleTimeout;
        this._onError = _onError;
        this._apiKey = _apiKey;
        this.ratelimit = 0;
        this._receivedMessagesCount = 0;
        this._connectionId = connectionCounter++;
        this._onConnectionEstabilished = async () => {
            try {
                const subscribeMessages = this.buildSubscribe();
                let symbolsCount = 0;
                this.onConnected();
                for (const message of subscribeMessages) {
                    this.send(message);
                    if (this.ratelimit > 0) {
                        await (0, utils_1.wait)(this.ratelimit);
                    }
                }
                this.debug("(connection id: %d) estabilished connection", this._connectionId);
                while (this._receivedMessagesCount < symbolsCount * 2) {
                    await (0, utils_1.wait)(100);
                }
                // wait a second just in case before starting fetching the snapshots
                await (0, utils_1.wait)(1 * utils_1.ONE_SEC_IN_MS);
                if (this._ws.readyState === ws_1.default.CLOSED) {
                    return;
                }
            }
            catch (e) {
                this.debug("(connection id: %d) providing manual snapshots error: %o", this._connectionId, e);
                this._ws.emit("error", e);
            }
        };
        this._onConnectionClosed = (event) => {
            this.debug("(connection id: %d) connection closed %s", this._connectionId, event.reason);
        };
        this.debug = (0, debug_1.default)(`volatility-ws:realtime:${_methodology}.${_timePeriod}.${_asset}`);
        const headers = {
            authorization: `Bearer ${_apiKey}`,
        };
        this._wsClientOptions = {
            perMessageDeflate: false,
            handshakeTimeout: 10 * utils_1.ONE_SEC_IN_MS,
            skipUTF8Validation: true,
            headers,
        };
        if (utils_1.httpsProxyAgent !== undefined) {
            this._wsClientOptions.agent = utils_1.httpsProxyAgent;
        }
    }
    [Symbol.asyncIterator]() {
        return this._stream();
    }
    async *_stream() {
        let staleConnectionTimerId;
        let pingTimerId;
        let retries = 0;
        while (true) {
            try {
                const envUrl = process.env.WSS_URL;
                const wsUrl = envUrl || this.wssURL;
                this.debug(`Connected to ${wsUrl}`);
                this._ws = new ws_1.default(wsUrl, this._wsClientOptions);
                this._ws.onopen = this._onConnectionEstabilished;
                this._ws.onclose = this._onConnectionClosed;
                staleConnectionTimerId = this._monitorConnectionIfStale();
                pingTimerId = this.pingTimer();
                const realtimeMessagesStream = ws_1.default.createWebSocketStream(this._ws, {
                    readableObjectMode: true,
                    readableHighWaterMark: 8096, // since we're in object mode, let's increase hwm a little from default of 16 messages buffered
                });
                for await (let message of realtimeMessagesStream) {
                    if (this.decompress !== undefined) {
                        message = this.decompress(message);
                    }
                    const messageDeserialized = JSON.parse(message);
                    if (this.isError(messageDeserialized)) {
                        throw new Error(`Received error message:${message.toString()}`);
                    }
                    if (true || this.isHeartbeat(messageDeserialized) === false) {
                        this._receivedMessagesCount++;
                    }
                    this.onMessage(messageDeserialized);
                    yield messageDeserialized;
                    if (retries > 0) {
                        retries = 0;
                    }
                }
                // clear monitoring connection timer and notify about disconnect
                if (staleConnectionTimerId !== undefined) {
                    clearInterval(staleConnectionTimerId);
                }
                yield { _disconnect: true };
            }
            catch (error) {
                if (this._onError !== undefined) {
                    this._onError(error);
                }
                retries++;
                const MAX_DELAY = 32 * 1000;
                const isRateLimited = error.message.includes("429");
                let delay;
                if (isRateLimited) {
                    delay = (MAX_DELAY / 2) * retries;
                }
                else {
                    delay = Math.pow(2, retries - 1) * 1000;
                    if (delay > MAX_DELAY) {
                        delay = MAX_DELAY;
                    }
                }
                this.debug("(connection id: %d) %s.%s.%s real-time feed connection error, retries count: %d, next retry delay: %dms, rate limited: %s error message: %o", this._connectionId, this._methodology, this._timePeriod, this._asset, retries, delay, isRateLimited, error);
                // clear monitoring connection timer and notify about disconnect
                if (staleConnectionTimerId !== undefined) {
                    clearInterval(staleConnectionTimerId);
                }
                yield { _disconnect: true };
                await (0, utils_1.wait)(delay);
            }
            finally {
                // stop timers
                if (staleConnectionTimerId !== undefined) {
                    clearInterval(staleConnectionTimerId);
                }
                if (pingTimerId !== undefined) {
                    clearInterval(pingTimerId);
                }
            }
        }
    }
    send(msg) {
        if (this._ws === undefined) {
            return;
        }
        if (this._ws.readyState !== ws_1.default.OPEN) {
            return;
        }
        this._ws.send(JSON.stringify(msg));
    }
    isHeartbeat(_msg) {
        return false;
    }
    onMessage(_msg) { }
    onConnected() { }
    _monitorConnectionIfStale() {
        if (this._idleTimeout === undefined || this._idleTimeout === 0) {
            return;
        }
        // set up timer that checks against open, but stale connections that do not return any data
        return setInterval(() => {
            if (this._ws === undefined) {
                return;
            }
            if (this._receivedMessagesCount === 0) {
                this.debug("(connection id: %d) did not received any messages within %d ms timeout, terminating connection...", this._connectionId, this._idleTimeout);
                this._ws.terminate();
            }
            this._receivedMessagesCount = 0;
        }, this._idleTimeout);
    }
    pingTimer() {
        return setInterval(() => {
            if (this._ws === undefined || this._ws.readyState !== ws_1.default.OPEN) {
                return;
            }
            this.debug(`sending ping`);
            this._ws.ping();
        }, 5 * utils_1.ONE_SEC_IN_MS);
    }
}
exports.RealTimeBase = RealTimeBase;
//# sourceMappingURL=realtimefeed.js.map