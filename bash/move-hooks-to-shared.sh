#!/bin/bash
set -e

echo "📦 Moving shared hooks to shared/hooks/..."

mkdir -p shared/hooks

mv mdw-mobile/components/useColorScheme.ts shared/hooks/
mv mdw-mobile/components/useColorScheme.web.ts shared/hooks/
mv mdw-mobile/components/useClientOnlyValue.ts shared/hooks/
mv mdw-mobile/components/useClientOnlyValue.web.ts shared/hooks/

echo "✅ Hooks moved successfully."
