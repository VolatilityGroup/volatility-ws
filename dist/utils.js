"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpsProxyAgent = exports.preprocess = exports.HttpError = exports.ONE_SEC_IN_MS = exports.normalizeId = exports.wait = void 0;
const https_proxy_agent_1 = __importDefault(require("https-proxy-agent"));
function wait(delayMS) {
    return new Promise((resolve) => {
        setTimeout(resolve, delayMS);
    });
}
exports.wait = wait;
function normalizeId({ methodology, timePeriod, asset, }) {
    return `${methodology}.${timePeriod},${asset}`;
}
exports.normalizeId = normalizeId;
exports.ONE_SEC_IN_MS = 1000;
class HttpError extends Error {
    constructor(status, responseText, url) {
        super(`HttpError: status code: ${status}, response text: ${responseText}`);
        this.status = status;
        this.responseText = responseText;
        this.url = url;
    }
}
exports.HttpError = HttpError;
async function* preprocess(methodology, timePeriod, asset, messages, withDisconnectMessages, currentTimestamp) {
    let lastLocal = currentTimestamp;
    for await (const messageWithTimestamp of messages) {
        if (messageWithTimestamp === undefined) {
            if (withDisconnectMessages === true && lastLocal !== undefined) {
                const disconnect = {
                    type: "disconnect",
                    id: normalizeId({ methodology, timePeriod, asset }),
                    localTimestamp: lastLocal,
                };
                yield disconnect;
            }
            continue;
        }
        lastLocal = messageWithTimestamp.localTimestamp;
        yield { ...messageWithTimestamp, localTimestamp: lastLocal };
    }
}
exports.preprocess = preprocess;
// const httpsAgent = new https.Agent({
//   keepAlive: true,
//   keepAliveMsecs: 10 * ONE_SEC_IN_MS,
//   maxSockets: 120,
// })
exports.httpsProxyAgent = process.env.HTTP_PROXY !== undefined
    ? (0, https_proxy_agent_1.default)(process.env.HTTP_PROXY)
    : undefined;
// const gotDefaultOptions: ExtendOptions = {}
// if (httpsProxyAgent !== undefined) {
//   gotDefaultOptions.agent = {
//     https: httpsProxyAgent,
//   }
// }
// export const httpClient = got.extend(gotDefaultOptions)
//# sourceMappingURL=utils.js.map