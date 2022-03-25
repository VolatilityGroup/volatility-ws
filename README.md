# Overview

The Volatility WebSocket API follows similar interface patterns as popular platforms such as Kraken, Coinbase and deribit. This early version of the API only provides realtime data for MFIV 14 day ETH.  Additional time periods, assets, methodologies, and historical data coming soon.

# Websocket API Servers
| Name | Endpoint | Purpose |
|---|---|---|
| Production | `wss://ws.prd.volatility.com` | For production and consumer facing use. |

# Getting an API Key
To use our WebSocket API a valid API key is required.  Here's how:
1. Join our Discord.
2. Go to the `#collabland-join` channel.
3. Click "Let's go!".
4. Click "Connect Wallet".
5. Choose a wallet connection and connet your wallet.
6. Click "Sign Message". 
7. Through your wallet, Sign the transaction. You should see a Wallet Connected! message.
7. Return to Discord.
8. Under COMMUNITY, you should now see a new channel called `#labs-volatility-api`. Go to this channel and request an API key.
9. Someone from our team will DM you an API key within 72 hours.

# Quick Start
Our API can be accessed through our npm package server-side or directly using the 
WebSocket Client API client-side.

If you clone this repository, you can run our example script in node by doing the following:
1. In your terminal run: 
```
npm install
```
2. Add your API key as an environment variable. In your terminal run: 

```
export VOLATILITY_API_KEY=<API_KEY>
```
- Replace `<API_KEY>` with your API key our team provided you.

3. In your terminal run: 
```
ts-node src/example.ts
```

You can see the example script source code [here](./src/example.ts).

## Server Side Applications
Currently, this package only works on the server-side.  A future release will support browser-based client-side applications.

Before you can use this package, you'll need to install it.

Install the package: 
```
npm i @volatility/volatility-ws
```

After it's installed, import the realtimeVolatility method for use.

Example:
```
import { realtimeVolatility } from "volatility-api"

const messages = realtimeVolatility({
   methodology: "MFIV"
   timePeriod: "14D",
   asset: "ETH",
   apiKey: "<API_KEY>"
})

// process messages via async iteration:
for await (const message of messages) {
   console.log(message);
}
```

The `realtimeVolatility` function includes the following options for managing the websocket interface.
```
realtimeVolatility({
   idleTimeout: number | undefined,   // default: 10000 - how long to wait for inactivity before giving up
   reconnect: boolean | undefined,    // default: true - reconnect on disconnect
   onError?: (error: Error) => void
})
```
### Future Updates
- Allow combining of indices.
- Use of the API with browser-based client-side applications.