import dbg from "debug"
import WebSocket from "ws"
import { ClientRequestArgs } from "http"
import { httpsProxyAgent, ONE_SEC_IN_MS, wait } from "../utils"
import { Asset, Methodology, Subscription } from "../types"

export type RealTimeFeed = {
  new (
    methodology: Methodology,
    timePeriod: string,
    asset: Asset,
    idleTimeout: number | undefined,
    onError?: (error: Error) => void,
    apiKey?: string
  ): RealTimeFeedIterable
}

let connectionCounter = 1

export type RealTimeFeedIterable = AsyncIterable<any>

export abstract class RealTimeBase implements RealTimeFeedIterable {
  [Symbol.asyncIterator]() {
    return this._stream()
  }

  protected readonly debug: dbg.Debugger
  protected abstract readonly wssURL: string
  protected readonly ratelimit: number = 0
  private _receivedMessagesCount = 0
  private _ws?: WebSocket
  private _connectionId = connectionCounter++
  private _wsClientOptions: WebSocket.ClientOptions | ClientRequestArgs

  constructor(
    protected readonly _methodology: Methodology,
    protected readonly _timePeriod: string,
    protected readonly _asset: Asset,
    private readonly _idleTimeout: number | undefined,
    private readonly _onError?: (error: Error) => void,
    private readonly _apiKey?: string
  ) {
    this.debug = dbg(
      `volatility-ws:realtime:${_methodology}.${_timePeriod}.${_asset}`
    )

    const headers = {
      authorization: `Bearer ${_apiKey}`,
    }

    this._wsClientOptions = {
      perMessageDeflate: false,
      handshakeTimeout: 10 * ONE_SEC_IN_MS,
      skipUTF8Validation: true,
      headers,
    } as any

    if (httpsProxyAgent !== undefined) {
      this._wsClientOptions.agent = httpsProxyAgent
    }
  }

  private async *_stream() {
    let staleConnectionTimerId
    let pingTimerId
    let retries = 0

    while (true) {
      try {
        const envUrl = process.env.WSS_URL
        const wsUrl = envUrl || this.wssURL

        this.debug(`Connected to ${wsUrl}`)

        this._ws = new WebSocket(wsUrl, this._wsClientOptions)
        this._ws.onopen = this._onConnectionEstabilished
        this._ws.onclose = this._onConnectionClosed

        staleConnectionTimerId = this._monitorConnectionIfStale()
        pingTimerId = this.pingTimer()

        const realtimeMessagesStream = (WebSocket as any).createWebSocketStream(
          this._ws,
          {
            readableObjectMode: true, // othwerwise we may end up with multiple messages returned by stream in single iteration
            readableHighWaterMark: 8096, // since we're in object mode, let's increase hwm a little from default of 16 messages buffered
          }
        ) as AsyncIterableIterator<Buffer>

        for await (let message of realtimeMessagesStream) {
          if (this.decompress !== undefined) {
            message = this.decompress(message)
          }

          const messageDeserialized = JSON.parse(message as any)

          if (this.isError(messageDeserialized)) {
            throw new Error(`Received error message:${message.toString()}`)
          }

          if (true || this.isHeartbeat(messageDeserialized) === false) {
            this._receivedMessagesCount++
          }

          this.onMessage(messageDeserialized)

          yield messageDeserialized

          if (retries > 0) {
            retries = 0
          }
        }

        // clear monitoring connection timer and notify about disconnect
        if (staleConnectionTimerId !== undefined) {
          clearInterval(staleConnectionTimerId)
        }
        yield { _disconnect: true }
      } catch (error: any) {
        if (this._onError !== undefined) {
          this._onError(error)
        }

        retries++

        const MAX_DELAY = 32 * 1000
        const isRateLimited = error.message.includes("429")

        let delay
        if (isRateLimited) {
          delay = (MAX_DELAY / 2) * retries
        } else {
          delay = Math.pow(2, retries - 1) * 1000

          if (delay > MAX_DELAY) {
            delay = MAX_DELAY
          }
        }

        this.debug(
          "(connection id: %d) %s.%s.%s real-time feed connection error, retries count: %d, next retry delay: %dms, rate limited: %s error message: %o",
          this._connectionId,
          this._methodology,
          this._timePeriod,
          this._asset,
          retries,
          delay,
          isRateLimited,
          error
        )

        // clear monitoring connection timer and notify about disconnect
        if (staleConnectionTimerId !== undefined) {
          clearInterval(staleConnectionTimerId)
        }
        yield { _disconnect: true }

        await wait(delay)
      } finally {
        // stop timers
        if (staleConnectionTimerId !== undefined) {
          clearInterval(staleConnectionTimerId)
        }

        if (pingTimerId !== undefined) {
          clearInterval(pingTimerId)
        }
      }
    }
  }

  protected send(msg: any) {
    if (this._ws === undefined) {
      return
    }
    if (this._ws.readyState !== WebSocket.OPEN) {
      return
    }
    this._ws.send(JSON.stringify(msg))
  }

  protected abstract buildSubscribe(): Subscription[]

  protected abstract isError(message: any): boolean

  protected isHeartbeat(_msg: any) {
    return false
  }

  protected onMessage(_msg: any) {}

  protected onConnected() {}

  protected decompress?: (msg: any) => Buffer

  private _monitorConnectionIfStale() {
    if (this._idleTimeout === undefined || this._idleTimeout === 0) {
      return
    }

    // set up timer that checks against open, but stale connections that do not return any data
    return setInterval(() => {
      if (this._ws === undefined) {
        return
      }

      if (this._receivedMessagesCount === 0) {
        this.debug(
          "(connection id: %d) did not received any messages within %d ms timeout, terminating connection...",
          this._connectionId,
          this._idleTimeout
        )
        this._ws!.terminate()
      }
      this._receivedMessagesCount = 0
    }, this._idleTimeout)
  }

  private pingTimer() {
    return setInterval(() => {
      if (this._ws === undefined || this._ws.readyState !== WebSocket.OPEN) {
        return
      }

      this.debug(`sending ping`)
      this._ws.ping()
    }, 5 * ONE_SEC_IN_MS)
  }

  private _onConnectionEstabilished = async () => {
    try {
      const subscribeMessages = this.buildSubscribe()

      let symbolsCount = 0
      this.onConnected()

      for (const message of subscribeMessages) {
        this.send(message)
        if (this.ratelimit > 0) {
          await wait(this.ratelimit)
        }
      }

      this.debug(
        "(connection id: %d) estabilished connection",
        this._connectionId
      )

      while (this._receivedMessagesCount < symbolsCount * 2) {
        await wait(100)
      }
      // wait a second just in case before starting fetching the snapshots
      await wait(1 * ONE_SEC_IN_MS)

      if (this._ws!.readyState === WebSocket.CLOSED) {
        return
      }
    } catch (e) {
      this.debug(
        "(connection id: %d) providing manual snapshots error: %o",
        this._connectionId,
        e
      )
      this._ws!.emit("error", e)
    }
  }

  private _onConnectionClosed = (event: WebSocket.CloseEvent) => {
    this.debug(
      "(connection id: %d) connection closed %s",
      this._connectionId,
      event.reason
    )
  }
}
