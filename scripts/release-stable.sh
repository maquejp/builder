#!/bin/bash

set -e

echo "🚀 Starting stable release process..."

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Ask for version type
echo "Select version bump type:"
echo "1) patch (0.0.0 → 0.0.1)"
echo "2) minor (0.0.0 → 0.1.0)" 
echo "3) major (0.0.0 → 1.0.0)"
read -p "Enter choice (1-3): " choice

case $choice in
    1) VERSION_TYPE="patch" ;;
    2) VERSION_TYPE="minor" ;;
    3) VERSION_TYPE="major" ;;
    *) echo "❌ Invalid choice"; exit 1 ;;
esac

# Build the project
echo "📦 Building project..."
npm run build

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📋 Current version: $CURRENT_VERSION"

# Bump version
echo "⬆️  Bumping to stable $VERSION_TYPE version..."
npm version $VERSION_TYPE

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "🎉 New stable version: $NEW_VERSION"

# Publish to npm with latest tag
echo "📤 Publishing to npm with latest tag..."
npm publish --tag latest

# Create git tag (npm version already created it, just push)
echo "🏷️  Pushing git tag..."
git push origin "v$NEW_VERSION"
git push origin main

echo "✅ Stable release complete!"
echo "📦 Install with: npm install @maquestiaux-foundry/stackcraft"