#!/usr/bin/env bash
# Build a signed Windows installer and publish it as a GitHub Release that the
# in-app updater picks up. Usage: scripts/release.sh "Release notes"
#
# Before running: bump "version" in src-tauri/tauri.conf.json and src-tauri/Cargo.toml,
# commit, and push. Needs the updater private key at ~/.tauri/obi.key (keep it backed
# up and never commit it: without it, installed copies can't be updated).
set -euo pipefail

cd "$(dirname "$0")/../src-tauri"
REPO="KeiviX/obi"
VERSION=$(node -p 'require("./tauri.conf.json").version')
TAG="v$VERSION"
NOTES="${1:-Obi $VERSION}"
KEY="${OBI_SIGNING_KEY:-$HOME/.tauri/obi.key}"

[ -f "$KEY" ] || { echo "Missing signing key: $KEY" >&2; exit 1; }
if gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
  echo "Release $TAG already exists. Bump the version first." >&2
  exit 1
fi

TAURI_SIGNING_PRIVATE_KEY="$(cat "$KEY")" TAURI_SIGNING_PRIVATE_KEY_PASSWORD="" \
  cargo tauri build --bundles nsis

BUNDLE="target/release/bundle/nsis"
SETUP="Obi_${VERSION}_x64-setup.exe"
[ -f "$BUNDLE/$SETUP.sig" ] || { echo "No signature produced for $SETUP" >&2; exit 1; }

# The updater manifest: version, notes and the signed installer for Windows x64.
SIG=$(cat "$BUNDLE/$SETUP.sig")
NOTES="$NOTES" SIG="$SIG" VERSION="$VERSION" URL="https://github.com/$REPO/releases/download/$TAG/$SETUP" \
  node -e '
    const fs = require("fs");
    fs.writeFileSync(process.argv[1], JSON.stringify({
      version: process.env.VERSION,
      notes: process.env.NOTES,
      pub_date: new Date().toISOString(),
      platforms: { "windows-x86_64": { signature: process.env.SIG, url: process.env.URL } },
    }, null, 2) + "\n");
  ' "$BUNDLE/latest.json"

gh release create "$TAG" --repo "$REPO" --title "Obi $VERSION" --notes "$NOTES" \
  "$BUNDLE/$SETUP" "$BUNDLE/$SETUP.sig" "$BUNDLE/latest.json"

echo "Published https://github.com/$REPO/releases/tag/$TAG"
