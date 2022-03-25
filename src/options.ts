import os from "os"
import path from "path"
import { Methodology } from "./types"
const pkg = require("../package.json")

const defaultOptions: Options = {
  endpoint: "https://api.dev.volatility.dev/v1",
  apiKey: "",
  _userAgent: `volatility-ws/${pkg.version} (+https://github.com/VolatilityGroup/volatility-ws)`,
}

let options: Options = { ...defaultOptions }

export function init(initOptions: Partial<Options> = {}) {
  options = { ...defaultOptions, ...initOptions }
}

export function getOptions() {
  return options as Readonly<Options>
}

export type IndexOptions = {
  methodology: Methodology
  timePeriod: "14D"
  asset: "ETH" | "BTC"
}

type Options = {
  endpoint: string
  apiKey: string
  _userAgent: string
}
