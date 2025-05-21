#!/bin/bash
set -e

echo "📦 Moving utility functions to shared/utils/..."

mkdir -p shared/utils

mv shared/contexts/config.ts shared/utils/ || echo "ℹ️ config.ts already placed or not needed"
mv shared/contexts/walletBridgeAsyncListen.ts shared/utils/ || echo "ℹ️ walletBridgeAsyncListen.ts already placed or not needed"
mv shared/contexts/isImageUrl.ts shared/utils/ || echo "ℹ️ isImageUrl.ts already placed or not needed"
mv shared/contexts/parseAppManifest.ts shared/utils/ || echo "ℹ️ parseAppManifest.ts already placed or not needed"

echo "✅ Utility functions moved successfully."
