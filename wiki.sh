#!/bin/bash
# Wiki server control script
# Usage: ./wiki.sh start | stop | restart | status

PIDFILE="/tmp/llm-wiki-server.pid"
PORT=5000
DIR="$(cd "$(dirname "$0")" && pwd)"

start() {
  if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "Wiki server already running (pid $(cat "$PIDFILE"))"
    return 1
  fi
  cd "$DIR"
  nohup bun run server.ts > /tmp/llm-wiki-server.log 2>&1 &
  echo $! > "$PIDFILE"
  sleep 1
  if kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "Wiki server started on http://localhost:$PORT (pid $(cat "$PIDFILE"))"
  else
    echo "Failed to start server. Check /tmp/llm-wiki-server.log"
    rm -f "$PIDFILE"
    return 1
  fi
}

stop() {
  if [ ! -f "$PIDFILE" ]; then
    # Try to find by port
    local pid=$(lsof -ti :$PORT 2>/dev/null)
    if [ -n "$pid" ]; then
      kill $pid 2>/dev/null
      echo "Wiki server stopped (pid $pid)"
    else
      echo "Wiki server not running"
    fi
    return 0
  fi
  local pid=$(cat "$PIDFILE")
  if kill "$pid" 2>/dev/null; then
    echo "Wiki server stopped (pid $pid)"
  else
    echo "Wiki server was not running"
  fi
  rm -f "$PIDFILE"
}

restart() {
  stop
  sleep 1
  start
}

status() {
  if [ -f "$PIDFILE" ] && kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
    echo "Wiki server running (pid $(cat "$PIDFILE")) on http://localhost:$PORT"
  else
    local pid=$(lsof -ti :$PORT 2>/dev/null)
    if [ -n "$pid" ]; then
      echo "Wiki server running (pid $pid) on http://localhost:$PORT"
    else
      echo "Wiki server not running"
    fi
  fi
}

case "${1:-start}" in
  start)   start ;;
  stop)    stop ;;
  restart) restart ;;
  status)  status ;;
  *)       echo "Usage: $0 {start|stop|restart|status}" ;;
esac
