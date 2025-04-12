#!/bin/bash
# Save this file as: bash/move-contexts-to-shared.sh
# Run with: ./bash/move-contexts-to-shared.sh

echo "📁 Moving WalletContext.tsx and UserContext.tsx to shared/contexts/..."

mkdir -p shared/contexts

if [ -f src/WalletContext.tsx ]; then
  mv src/WalletContext.tsx shared/contexts/WalletContext.tsx
  echo "✅ Moved src/WalletContext.tsx → shared/contexts/"
else
  echo "⚠️  src/WalletContext.tsx not found."
fi

if [ -f src/UserContext.tsx ]; then
  mv src/UserContext.tsx shared/contexts/UserContext.tsx
  echo "✅ Moved src/UserContext.tsx → shared/contexts/"
else
  echo "⚠️  src/UserContext.tsx not found."
fi
