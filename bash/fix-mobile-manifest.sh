#!/bin/bash
set -e

echo "🔍 Checking tsconfig.json..."
if grep -q "extends.*expo/tsconfig.base" mdw-mobile/tsconfig.json; then
  echo "✅ tsconfig.json looks fine."
else
  echo "❌ tsconfig.json missing or misconfigured."
  exit 1
fi

echo ""
echo "🧼 Clearing Metro cache and restarting..."

cd mdw-mobile

# Kill existing Metro instance if any
echo "🔪 Killing existing Metro if running..."
fuser -k 8081/tcp || true

# Start Metro in background, detach from shell
echo "🚀 Starting Metro bundler with --clear..."
nohup npx expo start --clear > metro.log 2>&1 &

echo "📝 Logs will stream to mdw-mobile/metro.log"
echo "✅ Metro bundler launched in background. You can scan the QR code when ready."
