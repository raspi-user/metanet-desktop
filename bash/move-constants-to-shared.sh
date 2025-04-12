#!/bin/bash
set -e

echo "📦 Moving constants to shared/constants/..."

mkdir -p shared/constants

mv mdw-mobile/constants/Colors.ts shared/constants/

echo "✅ Constants moved successfully."
