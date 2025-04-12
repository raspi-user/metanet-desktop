#!/bin/bash
set -e

echo "💀 Killing anything using port 8081..."
PID=$(sudo lsof -t -i:8081 || true)
if [ -n "$PID" ]; then
  echo "🔪 Killing process $PID"
  sudo kill -9 $PID
else
  echo "ℹ️ No process currently using 8081"
fi

echo "🧼 Clearing old Metro log..."
rm -f mdw-mobile/metro.log

echo "🚀 Starting Expo with --clear..."
cd mdw-mobile

# Start expo with log redirection and background process
npx expo start --clear > metro.log 2>&1 &

EXPO_PID=$!
echo "📡 Metro bundler started as PID $EXPO_PID"

echo "🕐 Waiting 3 seconds to let Metro start..."
sleep 3

echo "📜 Tailing mdw-mobile/metro.log..."
tail -f metro.log
