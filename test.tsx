import React from 'react'
import { createRoot } from 'react-dom/client'
import { UserInterface, WalletProvider } from './UserInterface'
import { WalletInterface } from '@bsv/sdk'
import { listen, emit } from '@tauri-apps/api/event'

const rootElement = document.getElementById('root')
const root = createRoot(rootElement!)

root.render(
  <React.StrictMode>
    <WalletProvider>
      <UserInterface
        onWalletReady={async (wallet: WalletInterface) => {
          console.log('WALLET READY. BRC-100 endpoints are live.')

          // Helper: Sleep so we can test concurrency if needed.
          const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

          // Listen for all HTTP requests from the Rust backend.
          await listen('http-request', async (event) => {
            let response: any = {
              request_id: '',
              status: 200,
              body: ''
            }

            try {
              // The Tauri/Rust side is presumably sending us something like:
              // {
              //   request_id: number,
              //   method: string,   // "POST" for create etc
              //   path: string,     // e.g. "/getVersion", "/createAction"
              //   headers: {...},
              //   body: string,     // JSON-encoded arguments
              // }
              const req = JSON.parse(String(event.payload || '{}'))

              // Keep the same request_id for the response.
              response.request_id = req.request_id

              // The body will contain the method arguments as JSON.
              const parsedBody = req.body ? JSON.parse(req.body) : {}

              console.log('HTTP Request:', req.path, parsedBody)

              // Decide which wallet method to call, based on req.path:
              switch (req.path) {
                /**
                 * 1. createAction
                 */
                case '/createAction':
                  try {
                    // Our createAction method signature is:
                    // createAction(args, originator?)
                    // so we forward the object we parsed from body.
                    const result = await wallet.createAction(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 2. signAction
                 */
                case '/signAction':
                  try {
                    const result = await wallet.signAction(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 3. abortAction
                 */
                case '/abortAction':
                  try {
                    const result = await wallet.abortAction(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 4. listActions
                 */
                case '/listActions':
                  try {
                    const result = await wallet.listActions(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 5. internalizeAction
                 */
                case '/internalizeAction':
                  try {
                    const result = await wallet.internalizeAction(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 6. listOutputs
                 */
                case '/listOutputs':
                  try {
                    const result = await wallet.listOutputs(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 7. relinquishOutput
                 */
                case '/relinquishOutput':
                  try {
                    const result = await wallet.relinquishOutput(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 8. getPublicKey
                 */
                case '/getPublicKey':
                  try {
                    const result = await wallet.getPublicKey(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 9. revealCounterpartyKeyLinkage
                 */
                case '/revealCounterpartyKeyLinkage':
                  try {
                    const result = await wallet.revealCounterpartyKeyLinkage(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 10. revealSpecificKeyLinkage
                 */
                case '/revealSpecificKeyLinkage':
                  try {
                    const result = await wallet.revealSpecificKeyLinkage(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 11. encrypt
                 */
                case '/encrypt':
                  try {
                    const result = await wallet.encrypt(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 12. decrypt
                 */
                case '/decrypt':
                  try {
                    const result = await wallet.decrypt(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 13. createHmac
                 */
                case '/createHmac':
                  try {
                    const result = await wallet.createHmac(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 14. verifyHmac
                 */
                case '/verifyHmac':
                  try {
                    const result = await wallet.verifyHmac(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 15. createSignature
                 */
                case '/createSignature':
                  try {
                    const result = await wallet.createSignature(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 16. verifySignature
                 */
                case '/verifySignature':
                  try {
                    const result = await wallet.verifySignature(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 17. acquireCertificate
                 */
                case '/acquireCertificate':
                  try {
                    const result = await wallet.acquireCertificate(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 18. listCertificates
                 */
                case '/listCertificates':
                  try {
                    const result = await wallet.listCertificates(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 19. proveCertificate
                 */
                case '/proveCertificate':
                  try {
                    const result = await wallet.proveCertificate(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 20. relinquishCertificate
                 */
                case '/relinquishCertificate':
                  try {
                    const result = await wallet.relinquishCertificate(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 21. discoverByIdentityKey
                 */
                case '/discoverByIdentityKey':
                  try {
                    const result = await wallet.discoverByIdentityKey(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 22. discoverByAttributes
                 */
                case '/discoverByAttributes':
                  try {
                    const result = await wallet.discoverByAttributes(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 23. isAuthenticated
                 */
                case '/isAuthenticated':
                  try {
                    const result = await wallet.isAuthenticated(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 24. waitForAuthentication
                 */
                case '/waitForAuthentication':
                  try {
                    const result = await wallet.waitForAuthentication(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 25. getHeight
                 */
                case '/getHeight':
                  try {
                    const result = await wallet.getHeight(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 26. getHeaderForHeight
                 */
                case '/getHeaderForHeight':
                  try {
                    const result = await wallet.getHeaderForHeight(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 27. getNetwork
                 */
                case '/getNetwork':
                  try {
                    const result = await wallet.getNetwork(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * 28. getVersion
                 */
                case '/getVersion':
                  try {
                    const result = await wallet.getVersion(
                      parsedBody.args,
                      parsedBody.originator
                    )
                    response.status = 200
                    response.body = JSON.stringify(result)
                  } catch (error) {
                    console.error(error)
                    response.status = 400
                    response.body = JSON.stringify(error)
                  }
                  break

                /**
                 * UNKNOWN PATH
                 */
                default:
                  console.warn('Unknown path:', req.path)
                  response.status = 404
                  response.body = `No such wallet method: ${req.path}`
                  break
              }

              // optional: artificial delay so we can test concurrency.
              await sleep(250)

            } catch (e) {
              console.error("Error parsing or handling event:", e)
              response.status = 500
              response.body = String(e)
            }

            // Emit the response (Rust side presumably is waiting for 'ts-response' events).
            emit('ts-response', response)
          })

          // That’s it! We have now mapped all 28 calls from BRC-100 to our `wallet` object.
        }}
      />
    </WalletProvider>
  </React.StrictMode>
)
