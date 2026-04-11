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
