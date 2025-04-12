#!/bin/bash

set -e

echo "✅ Bootstrapping Expo Wallet Project: mdw"

# Step 1: Create base Expo project with TypeScript
npx create-expo-app mdw-mobile --template expo-template-blank-typescript
cd mdw-mobile

# Step 2: Install dependencies
echo "📦 Installing dependencies..."
npm install \
  @bsv/sdk@^1.3.24 \
  @bsv/wallet-toolbox-client@^1.1.28 \
  react-native-get-random-values \
  expo-router \
  expo-secure-store \
  expo-local-authentication \
  expo-camera \
  expo-haptics \
  expo-font \
  expo-blur \
  expo-status-bar \
  expo-web-browser \
  react-native-qrcode-svg

# Step 3: Initialize expo-router
npx expo-router@latest init

# Step 4: Setup basic app screens
mkdir -p app
cat <<EOF > app/index.tsx
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Welcome to MDW Wallet 🚀</Text>
    </View>
  );
}
EOF

cat <<EOF > app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
EOF

# Step 5: Set up tsconfig paths
echo "🔧 Updating tsconfig.json paths..."
sed -i '/"compilerOptions": {/a\    "paths": { "@/*": ["./*"] },' tsconfig.json

# Step 6: Add gitignore entries
echo "🙈 Adding common ignores to .gitignore..."
cat <<EOF >> .gitignore

# Custom
node_modules/
.expo/
web-build/
dist/
.env*.local
*.tsbuildinfo
EOF

echo ""
echo "🎉 Done! Your MDW wallet is ready."
echo "👉 To start: cd mdw && npx expo start"
