# Metanet Desktop

BRC100 Wallet Desktop Application Example

- Runs JSON-API over TCP/3321
- Will soon run Wallet Wire over TCP/3301
- Lets apps talk to a wallet
- Authenticates with WAB
- Permissions management
- Trust and identity management
- ...

## To Run

You need Rust and Node installed so you can run Tauri.

Clone the repo, then:

```
npm i
npm run tauri dev
```

Some platforms require this, so install if needed:
```
npm i -g @rollup/rollup-darwin-x64 
```

- Choose your network (mainnet/testnet), WAB and pick your Auth Method (Twiloo Phone for now)
- Pick a Storage URL
- Proceed to the wallet greeter, enter your phone, code, password, save recovery key
- You are in! Now BSV apps will work.

## Compiled version

Coming soon.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## License

The license for the code in this repository is the Open BSV License.
