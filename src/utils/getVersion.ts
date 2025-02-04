import { listen } from '@tauri-apps/api/event'

// function to call from Rust
function getVersion(): string {
    return '0.1.2'
}

// listen for event emitted by rust
listen<string>('get-version-event', (event) => {
    // call the function, passing in data from rust
    getVersion()
})