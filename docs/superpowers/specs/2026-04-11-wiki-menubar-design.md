# WikiBar — macOS Menubar App Design

**Date:** 2026-04-11  
**Status:** Approved

## Purpose

A lightweight macOS menubar companion for the wiki server. Mirrors the ClaudeMonitorBar pattern: server status at a glance, start/stop/restart controls, one-click browser access.

## Architecture

Single Swift file compiled with `swiftc` — no Xcode project, no Swift Package Manager. Same build system as ClaudeMonitorBar (`build.sh` + `setup.sh`).

- **AppKit core:** `NSStatusBar`, `NSStatusItem`, `NSPopover`
- **SwiftUI content:** All popover UI in SwiftUI `View` structs
- **Bridge:** `NSHostingController(rootView:)` wraps SwiftUI into AppKit
- **State:** `@MainActor @ObservableObject` class (`WikiManager`) with `@Published` properties

## Location

`/Users/kennetkusk/code/wiki/WikiBar/` — co-located with the wiki repo.

```
WikiBar/
├── Sources/main.swift    # entire app (~250 lines)
├── build.sh              # swiftc compile + .app bundle
└── setup.sh              # copy to /Applications
```

## Data Model — WikiManager

Polls `GET http://localhost:5000/api/status` every 5 seconds.

```swift
@Published var isRunning: Bool       // HTTP 200 from /api/status
@Published var pageCount: Int        // response.pages
@Published var queueCount: Int       // response from GET /api/queue (count)
@Published var statusText: String    // "Running · 45 pages" or "Stopped"
```

Two polling calls per tick:
- `/api/status` → `isRunning`, `pageCount`
- `/api/queue` → `queueCount`

## Popover UI (320×380)

```
● Wiki                    45 pages · 2 queued
────────────────────────────────────────────
[Start]    [Stop]    [Restart]
────────────────────────────────────────────
[  Open Wiki in Browser              ↗  ]
────────────────────────────────────────────
[  Quit                                  ]
```

- Status dot: green (running) / red (stopped)
- Page count + queue badge: hidden when stopped
- Start disabled when running; Stop/Restart disabled when stopped
- Open Browser disabled when stopped; opens `http://localhost:5000`

## Menubar Icon

Uses the wiki's existing icon asset. Falls back to SF Symbol `"book.pages"` if not found.  
Icon size: 18×18 points (standard menubar dimensions).

## Server Control

Calls `./wiki.sh start|stop|restart` via `Process()`, same pattern as ClaudeMonitorBar's shell script invocation. Waits 1.5s then re-polls.

Wiki script path: `/Users/kennetkusk/code/wiki/wiki.sh`

## Build

```bash
swiftc Sources/main.swift \
  -o "build/WikiBar.app/Contents/MacOS/WikiBar" \
  -framework SwiftUI \
  -framework AppKit \
  -suppress-warnings
```

Info.plist includes `LSUIElement = true` (menubar-only, no dock icon).

## Success Criteria

- Menubar icon reflects server state within 5s of change
- Start/Stop/Restart buttons work reliably
- Page count and queue count update on each poll
- App launches on login (user can add manually via Login Items)
