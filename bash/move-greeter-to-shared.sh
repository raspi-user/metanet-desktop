#!/bin/bash

# Define source and destination directories
src_dir="src/components"
shared_dir="shared/components"

# Check if the source directory exists
if [ ! -d "$src_dir" ]; then
  echo "Source directory '$src_dir' not found!"
  exit 1
fi

# Check if the shared directory exists, if not, create it
if [ ! -d "$shared_dir" ]; then
  echo "Shared directory '$shared_dir' not found, creating it..."
  mkdir -p "$shared_dir"
fi

# Create the necessary subdirectories inside 'shared/components' for Greeter
mkdir -p "$shared_dir/Greeter"

# Move components into the shared directory
echo "📦 Moving PhoneEntry.tsx, AppLogo.tsx, PageLoading.tsx, WalletConfig.tsx to $shared_dir ..."
mv "$src_dir/PhoneEntry.tsx" "$shared_dir/PhoneEntry.tsx"
mv "$src_dir/AppLogo.tsx" "$shared_dir/AppLogo.tsx"
mv "$src_dir/PageLoading.tsx" "$shared_dir/PageLoading.tsx"
mv "$src_dir/WalletConfig.tsx" "$shared_dir/WalletConfig.tsx"

# Move context files into the shared directory
echo "📦 Moving WalletContext.tsx and UserContext.tsx to shared/contexts ..."
mv "src/pages/Greeter/../../WalletContext.tsx" "shared/contexts/WalletContext.tsx"
mv "src/pages/Greeter/../../UserContext.tsx" "shared/contexts/UserContext.tsx"

# Verify and print the new locations
echo "✅ Files moved successfully."
ls "$shared_dir"
