#!/bin/bash
set -e

echo "📦 Moving components to shared/components/..."

mkdir -p shared/components

mv mdw-mobile/components/Themed.tsx shared/components/
mv mdw-mobile/components/StyledText.tsx shared/components/
mv mdw-mobile/components/EditScreenInfo.tsx shared/components/
mv mdw-mobile/components/ExternalLink.tsx shared/components/

echo "✅ Components moved successfully."
