#!/bin/bash
set -e
cd "$(dirname "$0")"
bash build.sh
cp -r build/WikiBar.app /Applications/
echo "Installed to /Applications/WikiBar.app"
