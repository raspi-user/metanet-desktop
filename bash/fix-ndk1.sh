#!/bin/bash

echo "🔧 Fixing NDK and Java for Expo Android build..."

# 1. Set JAVA_HOME
export JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
echo "✅ JAVA_HOME set to $JAVA_HOME"

# 2. Set working NDK path
export ANDROID_NDK_HOME="$HOME/Android/Sdk/ndk/25.2.9519653"
echo "✅ ANDROID_NDK_HOME set to $ANDROID_NDK_HOME"

# 3. Remove broken NDK 26
if [ -d "$HOME/Android/Sdk/ndk/26.1.10909125" ]; then
    echo "🧹 Removing broken NDK 26..."
    rm -rf "$HOME/Android/Sdk/ndk/26.1.10909125"
fi

# 4. Install NDK 25 if missing
if [ ! -f "$ANDROID_NDK_HOME/source.properties" ]; then
    echo "📦 Downloading NDK 25.2.9519653..."
    yes | $HOME/Android/Sdk/cmdline-tools/latest/bin/sdkmanager "ndk;25.2.9519653"
fi

# 5. Patch CMakeLists.txt to force C++20
PATCH_FILE="node_modules/react-native-reanimated/android/CMakeLists.txt"
if grep -q "CMAKE_CXX_STANDARD" "$PATCH_FILE"; then
    echo "🟢 Already patched for C++20"
else
    echo "🔧 Patching CMakeLists.txt for C++20"
    sed -i '1s/^/set(CMAKE_CXX_STANDARD 20)\nset(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++20")\n/' "$PATCH_FILE"
fi

# 6. Clean previous builds
cd android
./gradlew clean
cd ..

# 7. Build the app
echo "🚀 Running: npx expo run:android"
npx expo run:android
