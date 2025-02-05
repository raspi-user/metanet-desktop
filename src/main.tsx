import React from 'react'
import { createRoot } from 'react-dom/client'
import { UserInterface, WalletProvider } from './UserInterface'
import {
  WalletInterface,
  CreateActionArgs,
  SignActionArgs,
  AbortActionArgs,
  ListActionsArgs,
  InternalizeActionArgs,
  ListOutputsArgs,
  RelinquishOutputArgs,
  GetPublicKeyArgs,
  RevealCounterpartyKeyLinkageArgs,
  RevealSpecificKeyLinkageArgs,
  WalletEncryptArgs,
  WalletDecryptArgs,
  CreateHmacArgs,
  VerifyHmacArgs,
  CreateSignatureArgs,
  VerifySignatureArgs,
  AcquireCertificateArgs,
  ListCertificatesArgs,
  ProveCertificateArgs,
  RelinquishCertificateArgs,
  DiscoverByIdentityKeyArgs,
  DiscoverByAttributesArgs,
  GetHeaderArgs,
  
} from '@bsv/sdk';
import { listen, emit } from '@tauri-apps/api/event'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement!)

root.render(
  <React.StrictMode>
    <WalletProvider>
      <UserInterface
        onWalletReady={async (wallet: WalletInterface) => {
          (window as any).externallyCallableWallet = wallet // for debugging / testing
          console.log('THE INTERFACE IS UP! WALLET:', wallet)

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

          const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
          // Listen for "http-request" events from the Rust backend.
          await listen('http-request', async (event) => {
            let response

            try {
              const req = JSON.parse(event.payload as string)
              console.log("Received HTTP request:")
              console.log("Method:", req.method)
              console.log("Path:", req.path)
              console.log("Headers:", req.headers)
              console.log("Body:", req.body)
              console.log("Request ID:", req.request_id)

              switch (req.path) {
                // 1. createAction
                case '/createAction': {
                  try {
                    const args = JSON.parse(req.body) as CreateActionArgs;

                    const result = await wallet.createAction(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('createAction error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 2. signAction
                case '/signAction': {
                  try {
                    const args = JSON.parse(req.body) as SignActionArgs

                    const result = await wallet.signAction(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('signAction error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 3. abortAction
                case '/abortAction': {
                  try {
                    const args = JSON.parse(req.body) as AbortActionArgs

                    const result = await wallet.abortAction(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('abortAction error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 4. listActions
                case '/listActions': {
                  try {
                    const args = JSON.parse(req.body) as ListActionsArgs

                    const result = await wallet.listActions(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('listActions error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 5. internalizeAction
                case '/internalizeAction': {
                  try {
                    const args = JSON.parse(req.body) as InternalizeActionArgs

                    const result = await wallet.internalizeAction(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('internalizeAction error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 6. listOutputs
                case '/listOutputs': {
                  try {
                    const args = JSON.parse(req.body) as ListOutputsArgs

                    const result = await wallet.listOutputs(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('listOutputs error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 7. relinquishOutput
                case '/relinquishOutput': {
                  try {
                    const args = JSON.parse(req.body) as RelinquishOutputArgs

                    const result = await wallet.relinquishOutput(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('relinquishOutput error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 8. getPublicKey
                case '/getPublicKey': {
                  try {
                    const args = JSON.parse(req.body) as GetPublicKeyArgs

                    const result = await wallet.getPublicKey(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('getPublicKey error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 9. revealCounterpartyKeyLinkage
                case '/revealCounterpartyKeyLinkage': {
                  try {
                    const args = JSON.parse(req.body) as RevealCounterpartyKeyLinkageArgs

                    const result = await wallet.revealCounterpartyKeyLinkage(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('revealCounterpartyKeyLinkage error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 10. revealSpecificKeyLinkage
                case '/revealSpecificKeyLinkage': {
                  try {
                    const args = JSON.parse(req.body) as RevealSpecificKeyLinkageArgs

                    const result = await wallet.revealSpecificKeyLinkage(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('revealSpecificKeyLinkage error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 11. encrypt
                case '/encrypt': {
                  try {
                    const args = JSON.parse(req.body) as WalletEncryptArgs

                    const result = await wallet.encrypt(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('encrypt error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 12. decrypt
                case '/decrypt': {
                  try {
                    const args = JSON.parse(req.body) as WalletDecryptArgs

                    const result = await wallet.decrypt(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('decrypt error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 13. createHmac
                case '/createHmac': {
                  try {
                    const args = JSON.parse(req.body) as CreateHmacArgs

                    const result = await wallet.createHmac(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('createHmac error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 14. verifyHmac
                case '/verifyHmac': {
                  try {
                    const args = JSON.parse(req.body) as VerifyHmacArgs

                    const result = await wallet.verifyHmac(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('verifyHmac error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 15. createSignature
                case '/createSignature': {
                  try {
                    const args = JSON.parse(req.body) as CreateSignatureArgs

                    const result = await wallet.createSignature(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('createSignature error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 16. verifySignature
                case '/verifySignature': {
                  try {
                    const args = JSON.parse(req.body) as VerifySignatureArgs

                    const result = await wallet.verifySignature(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('verifySignature error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 17. acquireCertificate
                case '/acquireCertificate': {
                  try {
                    const args = JSON.parse(req.body) as AcquireCertificateArgs

                    const result = await wallet.acquireCertificate(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('acquireCertificate error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 18. listCertificates
                case '/listCertificates': {
                  try {
                    const args = JSON.parse(req.body) as ListCertificatesArgs

                    const result = await wallet.listCertificates(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('listCertificates error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 19. proveCertificate
                case '/proveCertificate': {
                  try {
                    const args = JSON.parse(req.body) as ProveCertificateArgs

                    const result = await wallet.proveCertificate(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('proveCertificate error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 20. relinquishCertificate
                case '/relinquishCertificate': {
                  try {
                    const args = JSON.parse(req.body) as RelinquishCertificateArgs

                    const result = await wallet.relinquishCertificate(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('relinquishCertificate error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 21. discoverByIdentityKey
                case '/discoverByIdentityKey': {
                  try {
                    const args = JSON.parse(req.body) as DiscoverByIdentityKeyArgs

                    const result = await wallet.discoverByIdentityKey(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('discoverByIdentityKey error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 22. discoverByAttributes
                case '/discoverByAttributes': {
                  try {
                    const args = JSON.parse(req.body) as DiscoverByAttributesArgs

                    const result = await wallet.discoverByAttributes(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('discoverByAttributes error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 23. isAuthenticated
                case '/isAuthenticated': {
                  try {
                    const result = await wallet.isAuthenticated({})
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('isAuthenticated error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 24. waitForAuthentication
                case '/waitForAuthentication': {
                  try {
                    const result = await wallet.waitForAuthentication({})
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('waitForAuthentication error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 25. getHeight
                case '/getHeight': {
                  try {
                    const result = await wallet.getHeight({})
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('getHeight error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 26. getHeaderForHeight
                case '/getHeaderForHeight': {
                  try {
                    const args = JSON.parse(req.body) as GetHeaderArgs

                    const result = await wallet.getHeaderForHeight(args)
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('getHeaderForHeight error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 27. getNetwork
                case '/getNetwork': {
                  try {
                    const result = await wallet.getNetwork({})
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('getNetwork error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }

                // 28. getVersion
                case '/getVersion': {
                  try {
                    const result = await wallet.getVersion({})
                    response = {
                      request_id: req.request_id,
                      status: 200,
                      body: JSON.stringify(result),
                    }
                  } catch (error) {
                    console.error('getVersion error:', error)
                    response = {
                      request_id: req.request_id,
                      status: 400,
                      body: JSON.stringify(error),
                    }
                  }
                  break
                }
                
                default: {
                  response = {
                    request_id: req.request_id,
                    status: 404,
                    body: JSON.stringify({ error: 'Unknown wallet path: ' + req.path }),
                  }
                  break
                }
              }

              // arbitrary wait time for testing concurrent requests
              await sleep(5000)

              // Emit the response back to Rust.
              emit('ts-response', response)
            } catch (e) {
              console.error("Error handling http-request event:", e)
            }
          })
        }}
      />
    </WalletProvider>
  </React.StrictMode >
)
