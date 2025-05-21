#!/bin/bash
set -e

echo "🔧 Rewriting any lingering @/constants or @/components imports to shared/... in mdw-mobile..."

find mdw-mobile -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i \
  -e 's|@/constants/|shared/constants/|g' \
  -e 's|@/components/|shared/components/|g' {} +

echo "✅ Remaining import rewiring complete."
