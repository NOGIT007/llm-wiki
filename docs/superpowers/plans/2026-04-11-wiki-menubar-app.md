# WikiBar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a macOS menubar app that shows wiki server status and page/queue counts, with start/stop/restart controls and one-click browser access.

**Architecture:** Single Swift file compiled with `swiftc`, no Xcode or SPM. AppKit manages the menubar status item and NSPopover; SwiftUI defines the popover content. `WikiManager` polls `/api/status` and `/api/queue` every 5 seconds and calls `wiki.sh` for server control.

**Tech Stack:** Swift 5.9+, AppKit, SwiftUI, URLSession, `swiftc` direct compilation

---

## File Structure

| File | Purpose |
|------|---------|
| `WikiBar/Sources/main.swift` | Entire app: WikiManager, MenuBarView, AppDelegate, entry point |
| `WikiBar/build.sh` | Compile + bundle as .app |
| `WikiBar/setup.sh` | Copy to /Applications |

---

## Task 1: Scaffold project structure

**Files:**
- Create: `WikiBar/Sources/` (directory)
- Create: `WikiBar/build.sh`
- Create: `WikiBar/setup.sh`

- [ ] **Step 1: Create directories**

```bash
mkdir -p /Users/kennetkusk/code/wiki/WikiBar/Sources
```

- [ ] **Step 2: Write build.sh**

Create `WikiBar/build.sh`:

```bash
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
```

- [ ] **Step 3: Write setup.sh**

Create `WikiBar/setup.sh`:

```bash
#!/bin/bash
set -e
cd "$(dirname "$0")"
bash build.sh
cp -r build/WikiBar.app /Applications/
echo "Installed to /Applications/WikiBar.app"
```

- [ ] **Step 4: Make scripts executable**

```bash
chmod +x WikiBar/build.sh WikiBar/setup.sh
```

- [ ] **Step 5: Commit scaffold**

```bash
git add WikiBar/build.sh WikiBar/setup.sh
git commit -m "feat: scaffold WikiBar menubar app"
```

---

## Task 2: Write WikiManager (data model + server control)

**Files:**
- Create: `WikiBar/Sources/main.swift`

- [ ] **Step 1: Write main.swift with imports and data types**

Create `WikiBar/Sources/main.swift`:

```swift
import SwiftUI
import AppKit

// MARK: - Codable types

struct StatusResponse: Codable {
    let ok: Bool
    let pages: Int
}

struct QueueItem: Codable {
    let action: String
}
```

- [ ] **Step 2: Add WikiManager class**

Append to `WikiBar/Sources/main.swift`:

```swift
// MARK: - Wiki Manager

@MainActor
class WikiManager: ObservableObject {
    @Published var isRunning = false
    @Published var pageCount = 0
    @Published var queueCount = 0

    private var pollTimer: Timer?
    private let port = 5000
    private let wikiPath = "/Users/kennetkusk/code/wiki"

    init() { startPolling() }

    func startPolling() {
        pollTimer?.invalidate()
        pollTimer = Timer.scheduledTimer(withTimeInterval: 5, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.checkStatus() }
        }
        checkStatus()
    }

    func checkStatus() {
        fetchStatus()
        fetchQueue()
    }

    private func fetchStatus() {
        guard let url = URL(string: "http://localhost:\(port)/api/status") else { return }
        URLSession.shared.dataTask(with: url) { [weak self] data, response, _ in
            let ok = (response as? HTTPURLResponse)?.statusCode == 200
            let pages = data.flatMap { try? JSONDecoder().decode(StatusResponse.self, from: $0) }?.pages ?? 0
            Task { @MainActor in
                self?.isRunning = ok
                self?.pageCount = ok ? pages : 0
                if !ok { self?.queueCount = 0 }
            }
        }.resume()
    }

    private func fetchQueue() {
        guard let url = URL(string: "http://localhost:\(port)/api/queue") else { return }
        URLSession.shared.dataTask(with: url) { [weak self] data, _, _ in
            let count = data.flatMap { try? JSONDecoder().decode([QueueItem].self, from: $0) }?.count ?? 0
            Task { @MainActor in self?.queueCount = count }
        }.resume()
    }

    func startServer() {
        runControl("start")
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak self] in self?.checkStatus() }
    }

    func stopServer() {
        runControl("stop")
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in self?.checkStatus() }
    }

    func restartServer() {
        runControl("restart")
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { [weak self] in self?.checkStatus() }
    }

    private func runControl(_ command: String) {
        let scriptPath = "\(wikiPath)/wiki.sh"
        guard FileManager.default.fileExists(atPath: scriptPath) else { return }
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/bin/bash")
        process.arguments = ["-l", scriptPath, command]
        var env = ProcessInfo.processInfo.environment
        let extra = [NSHomeDirectory() + "/.bun/bin", "/opt/homebrew/bin", "/usr/local/bin"].joined(separator: ":")
        env["PATH"] = extra + ":" + (env["PATH"] ?? "/usr/bin:/bin")
        process.environment = env
        process.currentDirectoryURL = URL(fileURLWithPath: wikiPath)
        try? process.run()
    }
}
```

---

## Task 3: Write MenuBarView (SwiftUI popover UI)

**Files:**
- Modify: `WikiBar/Sources/main.swift` (append)

- [ ] **Step 1: Append MenuBarView to main.swift**

```swift
// MARK: - Menu Bar View

struct MenuBarView: View {
    @ObservedObject var wikiManager: WikiManager

    private var statsText: String {
        guard wikiManager.isRunning else { return "Stopped" }
        let pages = "\(wikiManager.pageCount) pages"
        let queued = wikiManager.queueCount > 0 ? " · \(wikiManager.queueCount) queued" : ""
        return pages + queued
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header
            HStack {
                Circle()
                    .fill(wikiManager.isRunning ? Color.green : Color.red)
                    .frame(width: 8, height: 8)
                Text("Wiki")
                    .font(.headline)
                Spacer()
                Text(statsText)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Divider()

            // Server controls
            HStack(spacing: 8) {
                Button { wikiManager.startServer() } label: {
                    Label("Start", systemImage: "play.fill")
                }.disabled(wikiManager.isRunning)

                Button { wikiManager.stopServer() } label: {
                    Label("Stop", systemImage: "stop.fill")
                }.disabled(!wikiManager.isRunning)

                Button { wikiManager.restartServer() } label: {
                    Label("Restart", systemImage: "arrow.clockwise")
                }.disabled(!wikiManager.isRunning)
            }
            .buttonStyle(.bordered)

            Divider()

            // Open in browser
            Button {
                NSWorkspace.shared.open(URL(string: "http://localhost:5000")!)
            } label: {
                Label("Open Wiki in Browser", systemImage: "safari")
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .disabled(!wikiManager.isRunning)

            Divider()

            Button { NSApplication.shared.terminate(nil) } label: {
                Label("Quit", systemImage: "power")
            }
        }
        .padding()
        .frame(width: 300)
    }
}
```

---

## Task 4: Write AppDelegate and entry point

**Files:**
- Modify: `WikiBar/Sources/main.swift` (append)

- [ ] **Step 1: Append AppDelegate and entry point to main.swift**

```swift
// MARK: - App Delegate

class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem!
    var popover: NSPopover!
    var wikiManager: WikiManager!

    func applicationDidFinishLaunching(_ notification: Notification) {
        wikiManager = WikiManager()

        let popover = NSPopover()
        popover.contentSize = NSSize(width: 320, height: 280)
        popover.behavior = .transient
        popover.contentViewController = NSHostingController(
            rootView: MenuBarView(wikiManager: wikiManager)
        )
        self.popover = popover

        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        if let button = statusItem.button {
            button.image = loadMenuBarIcon()
            button.action = #selector(togglePopover)
            button.target = self
        }
    }

    private func loadMenuBarIcon() -> NSImage? {
        if let url = Bundle.main.url(forResource: "menubar_icon", withExtension: "png"),
           let img = NSImage(contentsOf: url) {
            img.size = NSSize(width: 18, height: 18)
            return img
        }
        return NSImage(systemSymbolName: "books.vertical", accessibilityDescription: "Wiki")
    }

    @objc func togglePopover() {
        guard let button = statusItem.button else { return }
        if popover.isShown {
            popover.performClose(nil)
        } else {
            popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
            popover.contentViewController?.view.window?.makeKey()
        }
    }
}

// MARK: - Entry point

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
```

- [ ] **Step 2: Commit main.swift**

```bash
git add WikiBar/Sources/main.swift
git commit -m "feat: add WikiBar Swift source (WikiManager, MenuBarView, AppDelegate)"
```

---

## Task 5: Build and verify

**Files:**
- No new files — verify the build

- [ ] **Step 1: Build the app**

```bash
cd /Users/kennetkusk/code/wiki/WikiBar
bash build.sh
```

Expected output:
```
Building WikiBar...
Built: build/WikiBar.app
Run:   open 'build/WikiBar.app'
```

If `swiftc` is not found, run: `xcode-select --install`

- [ ] **Step 2: Ensure wiki server is running**

```bash
cd /Users/kennetkusk/code/wiki
./wiki.sh status
# if not running:
./wiki.sh start
```

- [ ] **Step 3: Launch the app**

```bash
open /Users/kennetkusk/code/wiki/WikiBar/build/WikiBar.app
```

- [ ] **Step 4: Smoke test**

Verify in the menubar:
1. `books.vertical` SF Symbol icon appears in menubar
2. Click icon → popover shows with green dot, page count, "Stopped" or page count
3. Start/Stop/Restart buttons work (check wiki.sh responds)
4. "Open Wiki in Browser" opens `http://localhost:5000` in default browser
5. Quit closes the app

- [ ] **Step 5: Kill app and commit build script**

```bash
# The build/ directory should be gitignored
echo "WikiBar/build/" >> /Users/kennetkusk/code/wiki/.gitignore
git add .gitignore WikiBar/
git commit -m "feat: WikiBar menubar app complete"
```

---

## Icon Note

The wiki uses an SVG favicon (dark bg, amber "W" letter). To use a custom PNG icon:
1. Export an 18×18 PNG from the SVG
2. Save as `WikiBar/menubar_icon.png`
3. Re-run `build.sh` — it copies the PNG into the bundle automatically
4. SF Symbol `books.vertical` is used as fallback when no PNG is present
