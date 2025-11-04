#!/bin/bash

set -e

echo "🚀 Starting beta release process..."

# Build the project
echo "📦 Building project..."
npm run build

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📋 Current version: $CURRENT_VERSION"

# Bump version
echo "⬆️  Bumping beta version..."
npm version prerelease --preid=beta

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "🎉 New version: $NEW_VERSION"

# Publish to npm with beta tag
echo "📤 Publishing to npm with beta tag..."
npm publish --tag beta

# Check if this should also be latest
echo "🔍 Checking if this should be the latest version..."
LATEST_VERSION=$(npm view @maquestiaux-foundry/stackcraft version 2>/dev/null || echo "0.0.0")

if [[ "$NEW_VERSION" > "$LATEST_VERSION" ]] || [[ "$NEW_VERSION" == "$LATEST_VERSION" ]]; then
    echo "✨ Promoting to latest tag..."
    npm dist-tag add @maquestiaux-foundry/stackcraft@$NEW_VERSION latest
    echo "🏷️  Tagged as both beta and latest"
else
    echo "📌 Keeping as beta only (latest is $LATEST_VERSION)"
fi

# Push git tag (npm version already created it)
echo "🏷️  Pushing git tag..."
git push origin "v$NEW_VERSION"

echo "✅ Beta release complete!"
echo "📦 Install with: npm install @maquestiaux-foundry/stackcraft@beta"
echo "📦 Or latest: npm install @maquestiaux-foundry/stackcraft@latest"