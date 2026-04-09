// ── Sidebar resize ──
const resizeHandle = document.getElementById('resize-handle');
const appEl = document.getElementById('app');
let isResizing = false;

resizeHandle.addEventListener('mousedown', (e) => {
  isResizing = true;
  resizeHandle.classList.add('dragging');
  document.body.classList.add('resizing');
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  const width = Math.max(180, Math.min(500, e.clientX));
  appEl.style.setProperty('--sidebar-width', width + 'px');
});

document.addEventListener('mouseup', () => {
  if (!isResizing) return;
  isResizing = false;
  resizeHandle.classList.remove('dragging');
  document.body.classList.remove('resizing');
  // Resize graph canvas if visible
  if (document.getElementById('graph-view').classList.contains('active')) {
    resizeCanvas();
  }
});

// State
let allPages = [];
let graphData = null;
let currentSlug = null;
let slugSet = new Set();
let pageHistory = [];

// Graph simulation state
let nodes = [];
let edges = [];
let simRunning = false;

const TYPE_COLORS = {
  source: '#7ec97e',
  entity: '#b4a0d4',
  concept: '#d4956a',
  analysis: '#d48fa5',
  unknown: '#6b6761',
};