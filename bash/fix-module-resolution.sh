#!/bin/bash

# Function to check and fix the import paths and clear cache
fix_module_resolution() {
  echo "🔧 Checking import paths and clearing cache..."

  # Step 1: Verify if the component exists in shared/components
  if [[ ! -f "shared/components/EditScreenInfo.tsx" ]]; then
    echo "❌ Error: shared/components/EditScreenInfo.tsx does not exist!"
    echo "✅ Please ensure the component is placed in the correct directory."
    exit 1
  else
    echo "✅ Component EditScreenInfo.tsx found in shared/components/"
  fi

  # Step 2: Ensure the import path in the code is correct (search for occurrences of the component)
  echo "🔍 Verifying import paths in the code..."
  grep -r "EditScreenInfo" mdw-mobile/app/ --include=\*.tsx

  # Step 3: Clear Metro bundler cache to resolve any stale paths
  echo "🧼 Clearing Metro bundler cache..."
  npx expo start --clear

  echo "✅ Cache cleared. You can now restart the project."
}

# Run the fix_module_resolution function
fix_module_resolution
