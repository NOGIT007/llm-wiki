---
title: "Swarm agent with Claude Code"
description: "Run parallel code reviews with Claude agent swarms in minutes."
date: "2026-02-10T23:33"
section: usecases
technology: "Claude Code"
subject: "Workflow"
embed_url: https://code.claude.com/docs/en/agent-teams
tags: []
author: kennet.dahl.kusk@visma.com
draft: true
image: "gs://et-cms-content-prod-etai-cm/images/learning/swarm-agent-with-claude-code-hero.png"
---
## Run Parallel Code Reviews with Claude Agent Swarms in Minutes

Agent swarms let you split complex tasks across multiple Claude instances that work together. You’ll learn how to set up a team, assign parallel code reviews, and monitor progress—all from a single terminal.

<img src="/api/content-image/learning/swarm-agent-with-claude-code-inline-1.png" alt="Claude agent team setup in terminal" style="max-width: 640px; width: 100%;" />

## Prerequisites

You need three things:

1. **Claude Code** installed and authenticated
2. **tmux** (macOS/Linux) or **iTerm2** (macOS)
3. **Agent teams enabled** in settings

## Enable Agent Teams

Agent teams are experimental and disabled by default. Turn them on by adding this to your `settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

This unlocks the `/team` command in Claude Code.

## Configure tmux for Split-Pane Mode

Split-pane mode shows each teammate in its own pane. Here’s how to set up tmux:

### Install tmux

```bash
# macOS
brew install tmux

# Linux (Debian/Ubuntu)
sudo apt install tmux
```

### Configure `~/.tmux.conf`

Add these settings to your config file:

```bash
# Enable mouse support
set -g mouse on

# Increase scrollback history
set -g history-limit 10000

# Start windows and panes at 1 (not 0)
set -g base-index 1
set -g pane-base-index 1

# Auto-renumber windows
set -g renumber-windows on

# Custom keybindings
bind-key h run-shell "~/.tmux/cheatsheet.sh"
bind-key | split-window -h
bind-key - split-window -v
bind-key r source-file ~/.tmux.conf \; display "Config reloaded"

# Pane navigation without prefix
bind -n M-Left select-pane -L
bind -n M-Right select-pane -R
bind -n M-Up select-pane -U
bind -n M-Down select-pane -D

# Status bar theme
set -g status-style bg=#1e1e2e,fg=#cdd6f4
set -g status-left "#[fg=#89b4fa]#S"
set -g status-right "#[fg=#cdd6f4]%H:%M %d-%b-%y"
```

### Create a Cheat Sheet

Save this script as `~/.tmux/cheatsheet.sh`:

```bash
#!/bin/bash
tmux display-popup -E "
  echo '=== tmux Cheat Sheet ==='
  echo
  echo 'Prefix: Ctrl+b'
  echo
  echo 'h       Show this help'
  echo '|       Split pane vertically'
  echo '-       Split pane horizontally'
  echo 'r       Reload config'
  echo
  echo 'Alt+Arrow  Move between panes'
  echo
  echo 'q/Esc   Close this popup'
"
```

Make it executable:

```bash
chmod +x ~/.tmux/cheatsheet.sh
```

> **Note:** Split-pane mode works best on macOS. Linux users may need to adjust tmux settings for compatibility.

<img src="/api/content-image/learning/swarm-agent-with-claude-code-inline-2.png" alt="tmux split-pane view with multiple Claude agents" style="max-width: 640px; width: 100%;" />

## Start Your First Agent Team

Run this command to create a team:

```bash
claude --teammate-mode tmux
```

Then prompt Claude to form a team:

```
I need a parallel code review for this pull request. Create a team with:
- One teammate to review the frontend changes
- One teammate to review the backend logic
- One teammate to check test coverage
```

Claude spawns a lead session and three teammates. The lead coordinates tasks while teammates work independently.

## Control Your Agent Team

### Choose a Display Mode

| Mode         | Description                                                                 | Best For                          |
|--------------|-----------------------------------------------------------------------------|-----------------------------------|
| **In-process** | All teammates run in the main terminal. Use `Shift+Up/Down` to switch.     | Quick tasks, minimal setup        |
| **Split panes** | Each teammate gets its own tmux pane. Click to interact.                   | Complex tasks, real-time monitoring |

Set the mode in `settings.json`:

```json
{
  "teammateMode": "tmux"
}
```

### Assign Tasks

The lead creates a shared task list. Teammates either:
- **Self-claim** tasks when they finish their current work
- **Get assigned** by the lead (e.g., "Assign the frontend review to Teammate 1")

### Require Plan Approval

For risky changes, force teammates to submit plans first:

```
Spawn a teammate to refactor the payment module. Require plan approval before any code changes.
```

The lead reviews plans and either approves or rejects them with feedback.

### Use Delegate Mode

Prevent the lead from writing code by enabling delegate mode:

1. Start a team
2. Press `Shift+Tab` to cycle into delegate mode

The lead now only handles coordination (spawning, messaging, task management).

<img src="/api/content-image/learning/swarm-agent-with-claude-code-inline-3.png" alt="Claude agent team task list and approval workflow" style="max-width: 640px; width: 100%;" />

## Best Practices for Parallel Work

### Give Teammates Enough Context

Each teammate needs:
- **Clear goals** (e.g., "Review the API changes for security flaws")
- **Access to relevant files** (attach or specify paths)
- **Success criteria** (e.g., "Flag any SQL injection risks")

### Size Tasks Appropriately

Break work into **10-30 minute chunks**. Smaller tasks:
- Reduce merge conflicts
- Make progress visible
- Allow quick pivots

### Avoid File Conflicts

Use these strategies:
- **Lock files** during edits (Claude handles this automatically)
- **Assign ownership** (e.g., "Teammate 1 owns `src/api/`")
- **Use branches** for large changes

### Monitor and Steer

Check progress with:
- **Task list**: Press `Ctrl+T` to toggle
- **Direct messages**: Use `Shift+Up/Down` to select a teammate
- **Pane output**: Watch real-time logs in split-pane mode

Redirect stuck teammates with prompts like:
```
Teammate 2: Pause the backend review. Focus on the new auth middleware instead.
```

## Key Use Cases

| Use Case                     | Team Structure                          | Why It Works                          |
|------------------------------|-----------------------------------------|---------------------------------------|
| **Parallel code review**     | 3 teammates (frontend, backend, tests)  | Catches issues across layers faster   |
| **Debugging**                | 2+ teammates (competing hypotheses)     | Tests theories simultaneously         |
| **Feature development**      | 4 teammates (UI, API, DB, docs)         | Parallelizes independent components   |
| **Research**                 | 3 teammates (different data sources)    | Aggregates findings efficiently       |

## Troubleshooting

### Teammates Not Appearing
- Verify `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set
- Check tmux is running (`tmux ls`)
- Restart Claude Code

### Too Many Permission Prompts
- Reduce the number of teammates
- Use delegate mode to limit lead actions

### Teammates Stopping on Errors
- Add error handling to your prompts:
  ```
  If you encounter errors, document them and continue with the next task.
  ```

### Orphaned tmux Sessions
Clean up with:
```bash
tmux kill-server
```

<img src="/api/content-image/learning/swarm-agent-with-claude-code-inline-4.png" alt="Cleaning up a Claude agent team after completion" style="max-width: 640px; width: 100%;" />

## Key Takeaways

- **Enable agent teams** by setting `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in `settings.json`
- **Use tmux split-pane mode** for real-time monitoring of multiple teammates
- **Start small** with 2-3 teammates and scale as needed
- **Break work into independent tasks** to maximize parallelization
- **Monitor progress** via the task list (`Ctrl+T`) and direct messages (`Shift+Up/Down`)
- **Clean up** with `/team shutdown` to avoid orphaned sessions

---

## Reference

[https://code.claude.com/docs/en/agent-teams](https://code.claude.com/docs/en/agent-teams)
