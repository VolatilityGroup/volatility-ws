"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptions = exports.init = void 0;
const pkg = require("../package.json");
const defaultOptions = {
    endpoint: "https://api.dev.volatility.dev/v1",
    apiKey: "",
    _userAgent: `volatility-ws/${pkg.version} (+https://github.com/VolatilityGroup/volatility-ws)`,
};
let options = { ...defaultOptions };
function init(initOptions = {}) {
    options = { ...defaultOptions, ...initOptions };
}
exports.init = init;
function getOptions() {
    return options;
}
exports.getOptions = getOptions;
//# sourceMappingURL=options.js.map