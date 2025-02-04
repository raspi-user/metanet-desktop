import { listen, emit } from '@tauri-apps/api/event';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function setupHttpRequestListener() {
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
}

setupHttpRequestListener().catch(console.error);
