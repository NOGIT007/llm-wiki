#!/bin/bash
set -e

APP_NAME="WikiBar"
BUNDLE_ID="com.kennetkusk.WikiBar"
EXECUTABLE_NAME="WikiBar"
APP_BUNDLE="build/${APP_NAME}.app"

echo "Building ${APP_NAME}..."

rm -rf build
mkdir -p "${APP_BUNDLE}/Contents/MacOS"
mkdir -p "${APP_BUNDLE}/Contents/Resources"

swiftc Sources/main.swift \
    -o "${APP_BUNDLE}/Contents/MacOS/${EXECUTABLE_NAME}" \
    -framework SwiftUI \
    -framework AppKit \
    -suppress-warnings

if [ -f "menubar_icon.png" ]; then
    cp menubar_icon.png "${APP_BUNDLE}/Contents/Resources/"
fi

cat > "${APP_BUNDLE}/Contents/Info.plist" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>${EXECUTABLE_NAME}</string>
    <key>CFBundleIdentifier</key>
    <string>${BUNDLE_ID}</string>
    <key>CFBundleName</key>
    <string>${APP_NAME}</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>13.0</string>
    <key>LSUIElement</key>
    <true/>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
PLIST

echo "Built: ${APP_BUNDLE}"
echo "Run:   open '${APP_BUNDLE}'"
