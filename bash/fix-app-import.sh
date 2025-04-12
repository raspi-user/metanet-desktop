#!/bin/bash
# Script to fix incorrect import paths to the App module

echo "🔧 Fixing import paths in the project..."

# Check for the correct App.tsx location
APP_PATH="../../App.tsx"
TARGET_FILE="mdw-expo/metanet-desktop/node_modules/expo/AppEntry.js"

# Verify if the file exists
if [[ -f $APP_PATH ]]; then
    echo "✅ App.tsx found at $APP_PATH"
else
    echo "❌ App.tsx not found at $APP_PATH"
    exit 1
fi

# Replace the incorrect import path in AppEntry.js
echo "🔍 Updating import path in AppEntry.js..."
sed -i '' 's|../../App|../App|' "$TARGET_FILE"

echo "✅ Import path updated successfully."

# Clear Metro Bundler cache and restart
echo "🧼 Clearing Metro cache and restarting..."
npm start --clear

echo "✅ Metro Bundler restarted successfully."
