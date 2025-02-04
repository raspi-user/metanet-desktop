import { listen, emit } from '@tauri-apps/api/event';

// Listen for the `echoTS` event from Rust
listen('echoTS', (event) => {
    const input = event.payload as string;
    console.log("Received event from Rust with input:", input);

    // Process the input (e.g., call your `echoTS` function)
    const output = echoTS(input);

    // Send the response back to Rust
    emit('echoTS-response', output);
    console.log("Sent response back to Rust:", output);
});

// Function to be called from Rust
function echoTS(input: string): string {
    // Perform some operations on the input string
    return `Echo: ${input}`;
}