#!/bin/bash

echo "📁 Moving WalletContext and UserContext to shared..."

mv src/WalletContext.tsx shared/contexts/WalletContext.tsx
mv src/UserContext.tsx shared/contexts/UserContext.tsx

echo "✅ Moved:
- src/WalletContext.tsx → shared/contexts/
- src/UserContext.tsx   → shared/contexts/"
