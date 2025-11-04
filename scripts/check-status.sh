#!/bin/bash

set -e

echo "🔍 Checking package status..."

PACKAGE_NAME="@maquestiaux-foundry/stackcraft"
CURRENT_VERSION=$(node -p "require('./package.json').version")

echo "📋 Local version: $CURRENT_VERSION"

# Get npm info
echo "📦 NPM Registry Info:"
LATEST_VERSION=$(npm view $PACKAGE_NAME version 2>/dev/null || echo "Not published")
BETA_VERSION=$(npm view $PACKAGE_NAME@beta version 2>/dev/null || echo "No beta")

echo "   Latest: $LATEST_VERSION"
echo "   Beta: $BETA_VERSION"

# Show all dist-tags
echo ""
echo "🏷️  All dist-tags:"
npm dist-tag ls $PACKAGE_NAME 2>/dev/null || echo "Package not found on npm"

# Show recent versions
echo ""
echo "📈 Recent versions:"
npm view $PACKAGE_NAME versions --json 2>/dev/null | tail -10 || echo "No versions found"