#!/bin/bash

echo "🛠 Updating tsconfig.json files to extend base..."

sed -i '1s/^/{\n  "extends": "..\/tsconfig.base.json",/' mdw-mobile/tsconfig.json
sed -i '1s/^/{\n  "extends": ".\/tsconfig.base.json",/' tsconfig.json

echo "✅ Updated:
- mdw-mobile/tsconfig.json
- tsconfig.json"
