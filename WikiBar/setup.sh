#!/bin/bash
set -e
cd "$(dirname "$0")"

TARGET="/Applications/WikiBar.app"

if [ -d "$TARGET" ]; then
    killall WikiBar 2>/dev/null || true
    rm -rf "$TARGET"
fi

bash build.sh
cp -r build/WikiBar.app /Applications/
echo "Installed to /Applications/WikiBar.app"
