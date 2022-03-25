import https from "https"
import createHttpsProxyAgent from "https-proxy-agent"
import got, { ExtendOptions } from "got"
import { Asset, Disconnect, Index, Methodology } from "./types"

export function wait(delayMS: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMS)
  })
}

export function normalizeId({
  methodology,
  timePeriod,
  asset,
}: {
  methodology: Methodology
  timePeriod: string
  asset: Asset
}) {
  return `${methodology}.${timePeriod},${asset}`
}

export const ONE_SEC_IN_MS = 1000

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly responseText: string,
    public readonly url: string
  ) {
    super(`HttpError: status code: ${status}, response text: ${responseText}`)
  }
}

export async function* preprocess(
  methodology: Methodology,
  timePeriod: string,
  asset: Asset,
  messages: AsyncIterableIterator<{ localTimestamp: Date; message: Index }>,
  withDisconnectMessages: boolean | undefined,
  currentTimestamp?: Date | undefined
) {
  let lastLocal: Date | undefined = currentTimestamp

  for await (const messageWithTimestamp of messages) {
    if (messageWithTimestamp === undefined) {
      if (withDisconnectMessages === true && lastLocal !== undefined) {
        const disconnect: Disconnect = {
          type: "disconnect",
          id: normalizeId({ methodology, timePeriod, asset }),
          localTimestamp: lastLocal,
        }
        yield disconnect as any
      }

      continue
    }

    lastLocal = messageWithTimestamp.localTimestamp

    yield { ...messageWithTimestamp, localTimestamp: lastLocal }
  }
}

// const httpsAgent = new https.Agent({
//   keepAlive: true,
//   keepAliveMsecs: 10 * ONE_SEC_IN_MS,
//   maxSockets: 120,
// })

export const httpsProxyAgent: https.Agent | undefined =
  process.env.HTTP_PROXY !== undefined
    ? createHttpsProxyAgent(process.env.HTTP_PROXY)
    : undefined

// const gotDefaultOptions: ExtendOptions = {}

// if (httpsProxyAgent !== undefined) {
//   gotDefaultOptions.agent = {
//     https: httpsProxyAgent,
//   }
// }

// export const httpClient = got.extend(gotDefaultOptions)
