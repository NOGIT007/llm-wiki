async function init() {
  const [pagesRes, graphRes] = await Promise.all([
    fetch(api('/api/pages')).then(r => r.json()),
    fetch(api('/api/graph')).then(r => r.json()),
  ]);

  allPages = pagesRes;
  graphData = graphRes;
  slugSet = new Set(allPages.map(p => p.slug));

  renderSidebar(allPages);
  initGraph();
  await loadVaults();
}
let sidebarFilter = 'all';

function setSidebarFilter(filter) {
  sidebarFilter = filter;
  document.querySelectorAll('.sidebar-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  renderSidebar(allPages);
}

function filterSidebar() {
  renderSidebar(allPages);
}

function renderSidebar(pages) {
  const searchQuery = (document.getElementById('sidebar-search')?.value || '').toLowerCase().trim();

  let filtered = pages;
  if (sidebarFilter !== 'all') {
    filtered = filtered.filter(p => p.type === sidebarFilter);
  }
  if (searchQuery) {
    filtered = filtered.filter(p => p.title.toLowerCase().includes(searchQuery) || p.slug.includes(searchQuery));
  }

  const groups = { concept: [], entity: [], source: [] };
  for (const p of filtered) {
    const g = groups[p.type] || groups.source;
    g.push(p);
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => a.title.localeCompare(b.title));
  }

  let html = '';
  for (const [type, label] of [['concept', 'Concepts'], ['entity', 'Entities'], ['source', 'Sources']]) {
    if (groups[type].length === 0) continue;
    html += `<div class="sidebar-section"><h3>${label} <span class="count">${groups[type].length}</span></h3>`;
    for (const p of groups[type]) {
      const isActive = p.slug === currentSlug;
      html += `<div class="sidebar-item${isActive ? ' active' : ''}" tabindex="0" data-slug="${p.slug}" onclick="openPage('${p.slug}')">
        <span class="type-dot ${p.type}"></span>
        <span>${p.title}</span>
      </div>`;
    }
    html += '</div>';
  }

  if (!html) {
    html = '<div style="padding:20px 16px;color:var(--text-dim);font-size:13px;text-align:center;">No pages match</div>';
  }

  document.getElementById('sidebar-content').innerHTML = html;
}