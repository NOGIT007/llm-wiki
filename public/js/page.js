async function openPage(slug) {
  const res = await fetch(api(`/api/page/${slug}`));
  if (!res.ok) return;
  const page = await res.json();
  currentSlug = slug;
  pageHistory.push(slug);

  document.getElementById('page-title').textContent = page.title;

  let meta = `<span class="page-tag type-tag">${esc(page.type)}</span>`;
  if (page.created) meta += `<span class="page-meta-sep">&middot;</span><span>Created ${esc(page.created)}</span>`;
  if (page.tags.length) meta += `<span class="page-meta-sep">&middot;</span>`;
  for (const tag of page.tags) meta += `<span class="page-tag">${esc(tag)}</span>`;
  document.getElementById('page-meta').innerHTML = meta;

  document.getElementById('page-content').innerHTML = renderMarkdown(page.content);
  renderBacklinks(slug);
  showView('page');

  document.getElementById('page-view').scrollTop = 0;

  document.querySelectorAll('.sidebar-item').forEach(el => {
    el.classList.toggle('active', el.dataset.slug === slug);
  });
}

function renderMarkdown(md) {
  md = md.replace(/\[\[([^\]]+)\]\]/g, (_, raw) => {
    // Support [[slug|Display Name]] alias syntax
    const parts = raw.split('|');
    const target = parts[0].trim();
    const display = parts.length > 1 ? parts.slice(1).join('|').trim() : target;
    const slug = target.toLowerCase().replace(/\s+/g, '-');
    const exists = slugSet.has(slug);
    return `<a class="wikilink ${exists ? '' : 'broken'}" tabindex="0" onclick="openPage('${esc(slug)}')" onkeydown="if(event.key==='Enter'){event.preventDefault();openPage('${esc(slug)}')}">${esc(display)}</a>`;
  });

  md = md.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  md = md.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  md = md.replace(/`([^`]+)`/g, '<code>$1</code>');
  md = md.replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  md = md.replace(/^- (.+)$/gm, '<li>$1</li>');
  md = md.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  md = md.replace(/<\/ul>\s*<ul>/g, '');
  md = md.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  const lines = md.split('\n');
  let result = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { result += '\n'; continue; }
    if (trimmed.startsWith('<')) { result += trimmed + '\n'; continue; }
    result += `<p>${trimmed}</p>\n`;
  }

  result = result.replace(/ -- /g, ' — ');
  return result;
}

function renderBacklinks(slug) {
  const backlinks = [];
  for (const node of graphData.nodes) {
    if (node.id === slug) continue;
    const page = graphData.edges.find(e =>
      (e.source === node.id && e.target === slug) ||
      (e.target === node.id && e.source === slug)
    );
    if (page) backlinks.push(node);
  }

  const el = document.getElementById('backlinks');
  if (backlinks.length === 0) {
    el.innerHTML = '';
    return;
  }

  let html = `<h3>Linked Pages (${backlinks.length})</h3>`;
  for (const bl of backlinks.sort((a, b) => a.title.localeCompare(b.title))) {
    html += `<a class="backlink-item" tabindex="0" onclick="openPage('${esc(bl.id)}')" onkeydown="if(event.key==='Enter'){event.preventDefault();openPage('${esc(bl.id)}')}">${esc(bl.title)}</a>`;
  }
  el.innerHTML = html;
}