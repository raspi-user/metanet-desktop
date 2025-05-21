#!/bin/bash

echo "📄 Creating tsconfig.base.json..."

cat <<EOF > tsconfig.base.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@shared/*": ["shared/*"]
    }
  }
}
EOF

echo "✅ Created tsconfig.base.json with @shared/* alias"
