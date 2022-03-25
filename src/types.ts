import { ASSETS, METHODOLOGIES } from "./consts"

export type Methodology = typeof METHODOLOGIES[number]

export type Asset = typeof ASSETS[number]

export type Index = {
  readonly type: "index"
  readonly id: string | undefined
  readonly symbols: string[]
  readonly dVol: number
  readonly invdVol: number
  readonly value: number
  readonly underlyingPrice: number
  readonly methodology: Methodology
  readonly timePeriod: string
  readonly asset: Asset
  readonly risklessRate: number
  readonly risklessRateAt: Date
  readonly risklessRateSource: string
  readonly timestamp: Date
  readonly localTimestamp: Date
}

export type Disconnect = {
  readonly type: "disconnect"
  readonly id: string
  readonly localTimestamp: Date
}

export type Subscription = {
  type: "SUBSCRIBE"
  channel: string
}
