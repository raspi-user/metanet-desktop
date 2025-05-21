#!/bin/bash
set -e

echo "✅ Bootstrapping Expo Wallet Project: mdw-mobile"

# 1. Create new Expo app with TypeScript template
npx create-expo-app mdw-mobile --template expo-template-blank-typescript

cd mdw-mobile

# 2. Install Expo Router v4 and initialize
npm install expo-router@latest

# 3. Initialize Router (creates app dir, _layout, etc)
npx expo-router init --tabs

# 4. Add Metro config to support aliases (optional, but recommended)
echo "module.exports = { resolver: { unstable_enableSymlinks: true } };" > metro.config.js

# 5. Start the dev server
echo "✅ Project setup complete."
echo "👉 Run: cd mdw-mobile && npm run web"
