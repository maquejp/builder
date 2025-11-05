# Versioning & CI/CD Automation

This project uses GitHub Actions for automated versioning, git tagging, and npm publishing.

## 🚀 Automated Versioning Workflow

### Trigger: Push to Main Branch

When code is pushed to the `main` branch (including PR merges), GitHub Actions automatically:

1. **Tests & Builds** the project
2. **Bumps the version** based on current version type
3. **Creates git tags**
4. **Publishes to npm**
5. **Creates GitHub releases** (for stable versions)

### Version Bump Strategy

- **Beta versions** (e.g., `0.0.0-beta.0.0.0`):

  - Bumped as prerelease: `0.0.0-beta.0.0.0` → `0.0.0-beta.0.0.1`
  - Published with `@beta` tag on npm

- **Stable versions** (e.g., `1.0.0`):
  - Bumped as patch: `1.0.0` → `1.0.1`
  - Published with `@latest` tag on npm

## 📦 Release Process

### Automated (Default)

1. Make your changes in a feature branch
2. Create PR to `main`
3. Merge PR → **Automatic release triggered**
4. Version bumped, tagged, and published automatically

### Manual (Emergency Only)

Manual releases are handled entirely by GitHub Actions. If needed in emergencies, you can use npm commands directly:

```bash
# Emergency beta release (rarely needed)
npm version prerelease --preid=beta && npm publish --tag beta

# Emergency stable release (rarely needed)
npm version patch && npm publish --tag latest
```

## 🏷️ Git Tags & Versioning

- Every release creates a git tag: `v1.0.1`, `v0.0.0-beta.0.0.1`
- Tags are automatically pushed to GitHub
- Stable releases create GitHub Releases with changelogs

## 📊 CI/CD Pipeline Details

### Test Job (Every Push/PR)

- Tests on Node.js 18.x and 20.x
- Builds project and validates artifacts
- Must pass before any release

### Release Job (Main Branch Only)

- Runs only after successful tests
- Automatic version detection and bumping
- npm authentication via `NPM_TOKEN` secret
- Git operations via `GITHUB_TOKEN`

## 🔍 Available Scripts

```bash
npm start              # Run development version
npm run build          # Build project
npm run build:clean    # Clean build (removes dist/)
npm test               # Run tests
npm run version:check  # Show current version
npm run status         # Check package status on npm
```

## 🛠️ Required Secrets

Ensure these secrets are configured in your GitHub repository:

- `NPM_TOKEN`: Your npm authentication token for publishing
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

## 📈 Version Progression Examples

### Beta to Beta

```text
0.0.0-beta.0.0.0 → 0.0.0-beta.0.0.1 → 0.0.0-beta.0.0.2
```

### Beta to Stable (Manual)

```text
0.0.0-beta.0.0.5 → (manual stable release) → 1.0.0
```

### Stable Progression

```text
1.0.0 → 1.0.1 → 1.0.2 (patch updates)
```

## 🔄 Workflow Status

Monitor your releases in:

- **GitHub Actions tab**: Build and release progress
- **GitHub Releases**: Published stable versions
- **npm package page**: All published versions with tags
- **Git tags**: All version tags in repository

## 💡 Best Practices

1. **Feature branches**: Develop in feature branches, merge to main
2. **Testing**: Ensure tests pass before merging
3. **Stable releases**: Use manual scripts when transitioning from beta to stable
4. **Version monitoring**: Check `npm run version:check` to see current version
5. **Release notes**: Stable releases auto-generate basic changelogs

---

**Current Version**: Run `npm run version:check` to see the current version.
