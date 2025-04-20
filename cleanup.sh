#!/bin/bash
# Remove macOS system files
find . -name ".DS_Store" -not -path "./.cursor/*" -not -path "./memory-bank/*" -delete

# Remove zip files except in .cursor and memory-bank
find . -name "*.zip" -not -path "./.cursor/*" -not -path "./memory-bank/*" -delete

# Remove dist/ directories except in .cursor and memory-bank
find . -type d -name "dist" -not -path "./.cursor/*" -not -path "./memory-bank/*" -prune -exec rm -rf '{}' +

# Remove node_modules/ directories except in .cursor and memory-bank
find . -type d -name "node_modules" -not -path "./.cursor/*" -not -path "./memory-bank/*" -prune -exec rm -rf '{}' +

# Print summary
echo "Cleanup complete. Excluded .env files, .cursor/, and memory-bank/."
