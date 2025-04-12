#!/bin/bash
set -e

echo "🧹 Cleaning up empty/obsolete component folders in mdw-mobile..."

# Remove now-empty folders
rmdir mdw-mobile/components 2>/dev/null || echo "ℹ️ mdw-mobile/components already removed or not empty"

echo "✅ Cleanup complete."
