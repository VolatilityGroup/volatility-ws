import { realtimeVolatility } from "./index"

const realTimeMessages = realtimeVolatility({
  methodology: "MFIV",
  timePeriod: "14D",
  asset: "ETH",
  apiKey: process.env.VOLATILITY_API_KEY,
  idleTimeout: 30000,
  onError: (error) => {
    console.error("** ERROR **", error)
  },
})

const processMessages = async () => {
  for await (const message of realTimeMessages) {
    console.log(message)
  }
}

;(async () => {
  try {
    await processMessages()
  } catch (e) {
    console.error("error", e)
  }
})()
