#!/bin/bash

echo "🔧 Fixing NDK and Java for Expo Android build..."

# Target NDK version
NDK_VERSION="25.2.9519653"
SDKMANAGER="$HOME/Android/Sdk/cmdline-tools/latest/bin/sdkmanager"

# Ensure correct Java version
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
echo "✅ JAVA_HOME set to $JAVA_HOME"

# Remove broken NDK 26
echo "🧹 Removing broken NDK 26.1..."
yes | "$SDKMANAGER" --uninstall "ndk;26.1.10909125"

# Install working NDK 25
echo "📦 Installing NDK $NDK_VERSION..."
yes | "$SDKMANAGER" "ndk;$NDK_VERSION"

# Export new NDK path
export ANDROID_NDK_HOME="$HOME/Android/Sdk/ndk/$NDK_VERSION"
echo "✅ ANDROID_NDK_HOME set to $ANDROID_NDK_HOME"

# Check if source.properties exists
if [[ -f "$ANDROID_NDK_HOME/source.properties" ]]; then
  echo "🟢 NDK installed correctly"
else
  echo "🔴 NDK install failed — no source.properties found"
  exit 1
fi

# Run Expo build
echo "🚀 Running: npx expo run:android"
npx expo run:android
