const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('graph-tooltip');

let W, H, dpr;
let dragging = null;
let hovering = null;
let gOffsetX = 0, gOffsetY = 0;
let scale = 1;
let panX = 0, panY = 0;
let isPanning = false;
let panStartX, panStartY;
let dragStartX = 0, dragStartY = 0;
let didDrag = false;

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  W = rect.width;
  H = rect.height;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Graph type filter
let graphFilteredTypes = new Set(); // empty = show all

function toggleGraphFilter(type) {
  if (graphFilteredTypes.has(type)) {
    graphFilteredTypes.delete(type);
  } else {
    graphFilteredTypes.add(type);
  }
  // Update legend styling
  document.querySelectorAll('.legend-item').forEach(el => {
    const t = el.dataset.type;
    el.classList.toggle('dimmed', graphFilteredTypes.size > 0 && !graphFilteredTypes.has(t));
  });
}

function isNodeVisible(n) {
  if (graphFilteredTypes.size === 0) return true;
  return graphFilteredTypes.has(n.type);
}

function zoomGraph(factor) {
  const cx = W / 2, cy = H / 2;
  const oldScale = scale;
  scale *= factor;
  scale = Math.max(0.2, Math.min(5, scale));
  panX = cx - (cx - panX) * (scale / oldScale);
  panY = cy - (cy - panY) * (scale / oldScale);
}

function resetGraphView() {
  scale = 1;
  panX = 0;
  panY = 0;
}

let selectedGraphNode = null;

function renderGraphStats() {
  const totalNodes = graphData.nodes.length;
  const totalEdges = graphData.edges.length;
  const typeCounts = { source: 0, entity: 0, concept: 0, analysis: 0 };
  for (const n of graphData.nodes) {
    typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
  }

  const linkCounts = {};
  for (const e of graphData.edges) {
    linkCounts[e.source] = (linkCounts[e.source] || 0) + 1;
    linkCounts[e.target] = (linkCounts[e.target] || 0) + 1;
  }
  const topConnected = Object.entries(linkCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => {
      const node = graphData.nodes.find(n => n.id === slug);
      return { title: node?.title || slug, count, slug };
    });

  const avgLinks = totalNodes > 0 ? (totalEdges * 2 / totalNodes).toFixed(1) : 0;
  const barColors = { source: 'var(--green)', entity: 'var(--purple)', concept: 'var(--orange)', analysis: 'var(--pink)' };

  document.getElementById('graph-stats').innerHTML = `
    <h4>Knowledge Graph</h4>
    <div class="stat-row"><span class="stat-label">Pages</span><span class="stat-value">${totalNodes}</span></div>
    <div class="stat-row"><span class="stat-label">Connections</span><span class="stat-value">${totalEdges}</span></div>
    <div class="stat-row"><span class="stat-label">Avg. links</span><span class="stat-value">${avgLinks}</span></div>
    <div class="stat-section">
      <h5>By Type</h5>
      ${['source', 'entity', 'concept'].map(t => `
        <div class="stat-bar-row">
          <span class="stat-bar-label">${t}</span>
          <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${(typeCounts[t] || 0) / totalNodes * 100}%;background:${barColors[t]}"></div></div>
          <span class="stat-bar-count">${typeCounts[t] || 0}</span>
        </div>
      `).join('')}
    </div>
    <div class="stat-section">
      <h5>Most Connected</h5>
      ${topConnected.map(n => `
        <div class="stat-bar-row" style="cursor:pointer" onclick="selectGraphNode('${n.slug}')">
          <span class="stat-bar-label" style="width:auto;flex:1;color:var(--accent);font-size:11px">${n.title}</span>
          <span class="stat-bar-count">${n.count}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function selectGraphNode(slug) {
  const node = nodes.find(n => n.id === slug);
  if (!node) return;
  selectedGraphNode = node;
  renderNodeStats(node);
}

function renderNodeStats(node) {
  const barColors = { source: 'var(--green)', entity: 'var(--purple)', concept: 'var(--orange)', analysis: 'var(--pink)' };
  const typeColor = barColors[node.type] || 'var(--text-dim)';

  // Find all connected nodes
  const connected = [];
  for (const e of edges) {
    if (nodes[e.source] === node) connected.push(nodes[e.target]);
    else if (nodes[e.target] === node) connected.push(nodes[e.source]);
  }

  // Group connections by type
  const connByType = {};
  for (const c of connected) {
    connByType[c.type] = (connByType[c.type] || 0) + 1;
  }

  // Sort connected by number of their own links (most connected first)
  const connSorted = connected
    .map(c => {
      const count = edges.filter(e => nodes[e.source] === c || nodes[e.target] === c).length;
      return { ...c, linkCount: count };
    })
    .sort((a, b) => b.linkCount - a.linkCount);

  document.getElementById('graph-stats').innerHTML = `
    <h4 style="display:flex;align-items:center;gap:8px;">
      <span style="width:10px;height:10px;border-radius:50%;background:${typeColor};flex-shrink:0;"></span>
      ${node.title}
    </h4>
    <div class="stat-row"><span class="stat-label">Type</span><span class="stat-value" style="color:${typeColor}">${node.type}</span></div>
    <div class="stat-row"><span class="stat-label">Connections</span><span class="stat-value">${connected.length}</span></div>
    ${Object.keys(connByType).length > 0 ? `
    <div class="stat-section">
      <h5>Connected Types</h5>
      ${Object.entries(connByType).sort((a,b) => b[1] - a[1]).map(([t, count]) => `
        <div class="stat-bar-row">
          <span class="stat-bar-label">${t}</span>
          <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${count / connected.length * 100}%;background:${barColors[t] || 'var(--text-dim)'}"></div></div>
          <span class="stat-bar-count">${count}</span>
        </div>
      `).join('')}
    </div>` : ''}
    <div class="stat-section">
      <h5>Linked Pages (${connected.length})</h5>
      ${connSorted.slice(0, 10).map(c => `
        <div class="stat-bar-row" style="cursor:pointer" onclick="selectGraphNode('${c.id}')">
          <span style="width:6px;height:6px;border-radius:50%;background:${barColors[c.type] || 'var(--text-dim)'};flex-shrink:0;"></span>
          <span class="stat-bar-label" style="width:auto;flex:1;color:var(--text-secondary);font-size:11px">${c.title}</span>
          <span class="stat-bar-count">${c.linkCount}</span>
        </div>
      `).join('')}
      ${connected.length > 10 ? `<div style="font-size:11px;color:var(--text-dim);padding:4px 0;">+${connected.length - 10} more</div>` : ''}
    </div>
    <div class="stat-section" style="display:flex;gap:6px;">
      <button class="graph-ctrl-btn" style="flex:1;width:auto;font-size:11px;height:28px;" onclick="openPage('${node.id}')">Open Page</button>
      <button class="graph-ctrl-btn" style="flex:1;width:auto;font-size:11px;height:28px;" onclick="selectedGraphNode=null;renderGraphStats()">Back</button>
    </div>
  `;
}

function initGraph() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  nodes = graphData.nodes.map((n, i) => ({
    ...n,
    x: W / 2 + (Math.random() - 0.5) * W * 0.6,
    y: H / 2 + (Math.random() - 0.5) * H * 0.6,
    vx: 0,
    vy: 0,
    r: Math.max(5, Math.min(18, 4 + n.links * 0.9)),
  }));

  edges = graphData.edges.map(e => ({
    source: nodes.findIndex(n => n.id === e.source),
    target: nodes.findIndex(n => n.id === e.target),
  })).filter(e => e.source >= 0 && e.target >= 0);

  renderGraphStats();
  simRunning = true;
  requestAnimationFrame(tick);
}

function tick() {
  if (!simRunning) return;
  simulate();
  draw();
  requestAnimationFrame(tick);
}

function simulate() {
  const alpha = 0.3;
  const repulsion = 1000;
  const attraction = 0.004;
  const centerGravity = 0.008;
  const damping = 0.85;

  for (const n of nodes) {
    n.vx += (W / 2 - n.x) * centerGravity;
    n.vy += (H / 2 - n.y) * centerGravity;
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      let dx = nodes[j].x - nodes[i].x;
      let dy = nodes[j].y - nodes[i].y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let force = repulsion / (dist * dist);
      let fx = dx / dist * force;
      let fy = dy / dist * force;
      nodes[i].vx -= fx;
      nodes[i].vy -= fy;
      nodes[j].vx += fx;
      nodes[j].vy += fy;
    }
  }

  for (const e of edges) {
    const s = nodes[e.source];
    const t = nodes[e.target];
    let dx = t.x - s.x;
    let dy = t.y - s.y;
    let dist = Math.sqrt(dx * dx + dy * dy) || 1;
    let force = (dist - 120) * attraction;
    let fx = dx / dist * force;
    let fy = dy / dist * force;
    s.vx += fx;
    s.vy += fy;
    t.vx -= fx;
    t.vy -= fy;
  }

  for (const n of nodes) {
    if (n === dragging) continue;
    n.vx *= damping;
    n.vy *= damping;
    n.x += n.vx * alpha;
    n.y += n.vy * alpha;
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(panX, panY);
  ctx.scale(scale, scale);

  // Draw edges
  for (const e of edges) {
    const s = nodes[e.source];
    const t = nodes[e.target];
    const sVis = isNodeVisible(s);
    const tVis = isNodeVisible(t);
    if (!sVis && !tVis) continue;

    const focusE = hovering || selectedGraphNode;
    const isHighlight = focusE && (s === focusE || t === focusE);
    const dimmed = graphFilteredTypes.size > 0 && (!sVis || !tVis);

    if (isHighlight) {
      ctx.strokeStyle = 'rgba(226, 164, 78, 0.5)';
      ctx.lineWidth = 2;
    } else if (dimmed) {
      ctx.strokeStyle = 'rgba(42, 42, 40, 0.25)';
      ctx.lineWidth = 0.3;
    } else {
      ctx.strokeStyle = 'rgba(60, 58, 55, 0.5)';
      ctx.lineWidth = 0.6;
    }
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.stroke();
  }

  // Draw nodes + labels
  const focusNode = hovering || selectedGraphNode;
  for (const n of nodes) {
    const vis = isNodeVisible(n);
    const isHovered = n === hovering;
    const isSelected = n === selectedGraphNode;
    const isFocused = isHovered || isSelected;
    const isConnected = focusNode && edges.some(e =>
      (nodes[e.source] === focusNode && nodes[e.target] === n) ||
      (nodes[e.target] === focusNode && nodes[e.source] === n)
    );

    const color = TYPE_COLORS[n.type] || TYPE_COLORS.unknown;
    const dimByFilter = graphFilteredTypes.size > 0 && !vis;
    const dimByFocus = focusNode && !isFocused && !isConnected;

    // Node circle
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);

    if (dimByFilter) {
      ctx.fillStyle = color + '15';
    } else if (dimByFocus) {
      ctx.fillStyle = color + '33';
    } else {
      ctx.fillStyle = color;
      if (isFocused) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 16;
      }
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    // Hover/selected ring
    if (isFocused) {
      ctx.strokeStyle = isSelected ? 'rgba(226, 164, 78, 0.9)' : 'rgba(232, 228, 222, 0.9)';
      ctx.lineWidth = isSelected ? 2.5 : 2;
      ctx.stroke();
    }

    // Labels — always show (scale-dependent)
    if (dimByFilter) continue;

    const showLabel = isFocused || isConnected || scale > 0.6 || n.links >= 3;
    if (!showLabel) continue;

    const fontSize = isFocused ? 13 : (isConnected ? 12 : 10);
    ctx.font = `${isFocused || isConnected ? '500' : '400'} ${fontSize}px 'DM Sans', sans-serif`;

    if (isFocused) {
      ctx.fillStyle = '#e8e4de';
    } else if (isConnected) {
      ctx.fillStyle = 'rgba(232, 228, 222, 0.7)';
    } else if (dimByFocus) {
      ctx.fillStyle = '#6b676122';
    } else {
      ctx.fillStyle = '#8a857d';
    }
    ctx.textAlign = 'center';

    // Text shadow for readability
    if (isFocused || isConnected) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(n.title, n.x, n.y + n.r + 14);
      ctx.restore();
    } else {
      ctx.fillText(n.title, n.x, n.y + n.r + 14);
    }
  }

  ctx.restore();
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left - panX) / scale,
    y: (e.clientY - rect.top - panY) / scale,
  };
}

function findNode(mx, my) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    const dx = mx - n.x;
    const dy = my - n.y;
    if (dx * dx + dy * dy < (n.r + 4) * (n.r + 4)) return n;
  }
  return null;
}

canvas.addEventListener('mousedown', (e) => {
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  didDrag = false;
  const { x, y } = getMousePos(e);
  const node = findNode(x, y);
  if (node) {
    dragging = node;
    gOffsetX = x - node.x;
    gOffsetY = y - node.y;
  } else {
    isPanning = true;
    panStartX = e.clientX - panX;
    panStartY = e.clientY - panY;
    // Deselect node when clicking empty space
    if (selectedGraphNode) {
      selectedGraphNode = null;
      renderGraphStats();
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;
  if (dx * dx + dy * dy > 25) didDrag = true;

  if (dragging) {
    const { x, y } = getMousePos(e);
    dragging.x = x - gOffsetX;
    dragging.y = y - gOffsetY;
    dragging.vx = 0;
    dragging.vy = 0;
  } else if (isPanning) {
    panX = e.clientX - panStartX;
    panY = e.clientY - panStartY;
  } else {
    const { x, y } = getMousePos(e);
    const node = findNode(x, y);
    hovering = node;
    canvas.style.cursor = node ? 'pointer' : 'grab';

    if (node) {
      const rect = canvas.getBoundingClientRect();
      tooltip.style.display = 'block';
      tooltip.style.left = (e.clientX - rect.left + 12) + 'px';
      tooltip.style.top = (e.clientY - rect.top - 30) + 'px';
      tooltip.innerHTML = `<strong>${node.title}</strong><br><span style="color:var(--text-dim)">${node.type} &middot; ${node.links} links</span>`;
    } else {
      tooltip.style.display = 'none';
    }
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (dragging && !didDrag) {
    selectGraphNode(dragging.id);
  }
  dragging = null;
  isPanning = false;
});

canvas.addEventListener('dblclick', (e) => {
  const { x, y } = getMousePos(e);
  const node = findNode(x, y);
  if (node) {
    openPage(node.id);
  }
});

canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const oldScale = scale;
  scale *= e.deltaY > 0 ? 0.93 : 1.07;
  scale = Math.max(0.2, Math.min(5, scale));

  panX = mx - (mx - panX) * (scale / oldScale);
  panY = my - (my - panY) * (scale / oldScale);
}, { passive: false });