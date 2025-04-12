#!/bin/bash

# Set the port to 8083 for Metro bundler
echo "🔧 Setting Metro Bundler to port 8083..."

# Set the environment variable for the port
export REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.243
export METRO_PORT=8083

# Start Expo with the new port configuration
npx expo start --port 8083

