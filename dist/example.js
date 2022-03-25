"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const realTimeMessages = (0, index_1.realtimeVolatility)({
    methodology: "MFIV",
    timePeriod: "14D",
    asset: "ETH",
    apiKey: process.env.VOLATILITY_API_KEY,
    idleTimeout: 30000,
    onError: (error) => {
        console.error("** ERROR **", error);
    },
});
const processMessages = async () => {
    for await (const message of realTimeMessages) {
        console.log(message);
    }
};
(async () => {
    try {
        await processMessages();
    }
    catch (e) {
        console.error("error", e);
    }
})();
//# sourceMappingURL=example.js.map