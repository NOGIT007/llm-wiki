async function checkStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    document.getElementById('status-dot').classList.remove('offline');
    document.getElementById('status-text').textContent = `Server up ${formatUptime(data.uptime)}`;
    document.getElementById('page-count').textContent = `${data.pages} pages`;
  } catch {
    document.getElementById('status-dot').classList.add('offline');
    document.getElementById('status-text').textContent = 'Server offline';
    document.getElementById('page-count').textContent = '';
  }
}

function formatUptime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

async function reloadWiki() {
  try {
    const res = await fetch(api('/api/reload'));
    const data = await res.json();
    document.getElementById('status-text').textContent = `Reloaded ${data.pages} pages`;
    const [pagesRes, graphRes] = await Promise.all([
      fetch(api('/api/pages')).then(r => r.json()),
      fetch(api('/api/graph')).then(r => r.json()),
    ]);
    allPages = pagesRes;
    graphData = graphRes;
    slugSet = new Set(allPages.map(p => p.slug));
    renderSidebar(allPages);
    if (currentSlug && document.getElementById('page-view').classList.contains('active')) {
      openPage(currentSlug);
    }
  } catch {
    document.getElementById('status-text').textContent = 'Reload failed';
  }
}

setInterval(checkStatus, 30000);