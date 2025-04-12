#!/bin/bash
# Save this file as: bash/update-imports-in-project.sh
# Run with: ./bash/update-imports-in-project.sh

echo "🔧 Updating imports in src/ and mdw-mobile/ to use @shared/contexts/..."

grep -rl "from '../WalletContext'" src/ | xargs sed -i "s|from '../WalletContext'|from '@shared/contexts/WalletContext'|g"
grep -rl "from '../../WalletContext'" src/ | xargs sed -i "s|from '../../WalletContext'|from '@shared/contexts/WalletContext'|g"
grep -rl "from '../UserContext'" src/ | xargs sed -i "s|from '../UserContext'|from '@shared/contexts/UserContext'|g"
grep -rl "from '../../UserContext'" src/ | xargs sed -i "s|from '../../UserContext'|from '@shared/contexts/UserContext'|g"

grep -rl "from '../WalletContext'" mdw-mobile/ | xargs sed -i "s|from '../WalletContext'|from '@shared/contexts/WalletContext'|g"
grep -rl "from '../UserContext'" mdw-mobile/ | xargs sed -i "s|from '../UserContext'|from '@shared/contexts/UserContext'|g"

echo "✅ Imports updated to use shared context paths."
