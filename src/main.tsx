import React from 'react'
import { createRoot } from 'react-dom/client'
import { UserInterface, WalletProvider } from './UserInterface'
import { WalletInterface } from '@bsv/sdk';
import { listen, emit } from '@tauri-apps/api/event';

const rootElement = document.getElementById('root')
const root = createRoot(rootElement!)

root.render(
  <React.StrictMode>
    <WalletProvider>
      <UserInterface
        onWalletReady={async (wallet: WalletInterface) => {
          console.log('THE INTERFACE IS UP! WALLET:', wallet);
          (window as any).externallyCallableWallet = wallet; // for debugging / testing

          ////// TODO: MATT AND JACKIE:
          // You are given a WalletInterface as a parameter.
          // Your task is to do the following:

          // Within this function you are already listening for HTTP requests and responses.
          // 
          // A request can come in over HTTP and it would be sent to you by the following code:
          // https://github.com/bitcoin-sv/ts-sdk/blob/master/src/wallet/substrates/HTTPWalletJSON.ts
          // 
          // When an HTTP request comes in, that came from the above-linked code (in that format),
          // call into the Wallet with the parameters provided by the request.
          // Then, wait for the response. If the wallet throws an Error, the HTTP response should be an error.
          // Otherwise, the response should be the return value from the Wallet, in the way that we would expect.
          //
          // Work exclusively within this function to parse out the HTTP requests, call into the Wallet, and get
          // the responses. Then send them back to the person who made the request over HTTP.
          // Currently, all methods will probably return "user is not authenticated" errors, but that is expected.
          // When the UI is finished, this will no longer be the case.

          const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
          // Listen for "http-request" events from the Rust backend.
          await listen('http-request', async (event) => {
            try {
              const req = JSON.parse(event.payload as string);
              console.log("Received HTTP request:");
              console.log("Method:", req.method);
              console.log("Path:", req.path);
              console.log("Headers:", req.headers);
              console.log("Body:", req.body);
              console.log("Request ID:", req.request_id);

              // In a production app you might show a UI to decide on the response.
              // For this demo, we automatically respond with a simple message.
              const response = {
                request_id: req.request_id,
                status: 200,
                body: `Hello from TypeScript! You requested ${req.path}`
              };

              // arbitrary wait time for testing concurrent requests
              await sleep(5000)

              // Emit the response back to Rust.
              emit('ts-response', response);
            } catch (e) {
              console.error("Error handling http-request event:", e);
            }
          });
        }}
      />
    </WalletProvider>
  </React.StrictMode >
);
