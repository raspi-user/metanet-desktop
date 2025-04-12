#!/bin/bash

echo "📄 Linking Greeter screen to mobile router..."

mkdir -p mdw-mobile/app

cat <<EOF > mdw-mobile/app/greeter.tsx
import GreeterScreen from '../../shared/components/GreeterScreen'
export default GreeterScreen
EOF

echo "✅ Linked mdw-mobile/app/greeter.tsx to shared/components/GreeterScreen.tsx"
