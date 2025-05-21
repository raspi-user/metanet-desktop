#!/bin/bash
set -e

echo "🔧 Rewriting imports in mdw-mobile to use shared/...";

declare -A replacements=(
  ["@/components/EditScreenInfo"]="shared/components/EditScreenInfo"
  ["@/components/ExternalLink"]="shared/components/ExternalLink"
  ["@/components/Themed"]="shared/components/Themed"
  ["@/components/StyledText"]="shared/components/StyledText"
  ["@/components/useColorScheme"]="shared/hooks/useColorScheme"
  ["@/components/useClientOnlyValue"]="shared/hooks/useClientOnlyValue"
)

# Find all .ts and .tsx files
find mdw-mobile -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  for from in "${!replacements[@]}"; do
    to=${replacements[$from]}
    sed -i "s|from '$from|from '$to|g" "$file"
    sed -i "s|from \"$from|from \"$to|g" "$file"
  done
done

echo "✅ Rewiring complete."
