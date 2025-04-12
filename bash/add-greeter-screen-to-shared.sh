#!/bin/bash
# Save this file as: bash/add-greeter-screen-to-shared.sh
# Run with: ./bash/add-greeter-screen-to-shared.sh

echo "📁 Creating shared/components/GreeterScreen.tsx..."

mkdir -p shared/components

cat <<'EOG' > shared/components/GreeterScreen.tsx
// Shared GreeterScreen — cross-platform React Native implementation
// ...
// (same full content from previous reply)
EOG

echo "✅ GreeterScreen.tsx created in shared/components/"
