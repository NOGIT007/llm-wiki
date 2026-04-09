async function loadConfig() {
  try {
    const config = await fetch('/api/config').then(r => r.json());
    // GitHub link
    const ghLink = document.getElementById('github-link');
    if (config.githubUrl) {
      ghLink.href = config.githubUrl;
      ghLink.style.display = 'flex';
    }
    return config;
  } catch { return {}; }
}

async function loadManageView() {
  try {
    const [healthRes, configRes, queueRes, backupRes] = await Promise.all([
      fetch(api('/api/wiki/health')).then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
      fetch('/api/queue').then(r => r.json()),
      fetch('/api/backup/status').then(r => r.json()),
    ]);
    document.getElementById('auto-ingest-toggle').checked = configRes.autoIngest || false;
    renderManageView(healthRes, queueRes, backupRes);
  } catch {
    document.getElementById('health-grid').innerHTML = '<div class="manage-empty">Failed to load wiki health data</div>';
  }
}

async function toggleAutoIngest(enabled) {
  await fetch('/api/config', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ autoIngest: enabled }),
  });
  showToast(enabled ? 'Auto-ingest enabled — Claude will process new files on startup' : 'Auto-ingest disabled');
}

function showToast(msg) {
  const el = document.getElementById('manage-toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

async function queueIngest(filename) {
  await fetch('/api/queue', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'ingest', target: filename }),
  });
  showToast(`Queued: ingest ${filename}`);
  loadManageView();
}

async function queueIngestAll(files) {
  for (const f of files) {
    await fetch('/api/queue', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'ingest', target: f }),
    });
  }
  showToast(`Queued ${files.length} files for ingestion`);
  loadManageView();
}

async function queueFixIssues() {
  await fetch('/api/queue', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'fix-issues' }),
  });
  showToast('Queued: fix wiki issues — Claude will process on next chat');
  loadManageView();
}

async function triggerBackup() {
  try {
    const res = await fetch('/api/backup', { method: 'POST' });
    const data = await res.json();
    if (data.ok) {
      showToast('Backup started — uploading to GCS...');
      // Poll for completion
      const poll = setInterval(async () => {
        const status = await fetch('/api/backup/status').then(r => r.json());
        if (!status.inProgress) {
          clearInterval(poll);
          if (status.error) showToast(`Backup failed: ${status.error}`);
          else showToast(`Backup complete — ${status.filesUploaded} files uploaded`);
          loadManageView();
        }
      }, 2000);
    } else {
      showToast(`Backup failed: ${data.error}`);
    }
  } catch (err) {
    showToast(`Backup failed: ${err.message}`);
  }
  loadManageView();
}

async function clearQueue() {
  await fetch('/api/queue', { method: 'DELETE' });
  showToast('Queue cleared');
  loadManageView();
}

function renderManageView(data, queue = [], backup = {}) {
  const { raw, wiki } = data;
  const pendingCount = raw.pending.length;
  const brokenCount = wiki.brokenLinks.length;
  const orphanCount = wiki.orphans.length;
  const queuedFiles = new Set(queue.filter(q => q.action === 'ingest').map(q => q.target));
  const fixQueued = queue.some(q => q.action === 'fix-issues');
  const queueCount = queue.length;

  // Health cards
  document.getElementById('health-grid').innerHTML = `
    <div class="health-card">
      <div class="card-label">Raw Sources</div>
      <div class="card-value">${raw.total}</div>
      <div class="card-detail">${raw.ingested.length} ingested</div>
    </div>
    <div class="health-card">
      <div class="card-label">Pending Ingest</div>
      <div class="card-value ${pendingCount > 0 ? 'warn' : 'good'}">${pendingCount}</div>
      <div class="card-detail">${pendingCount > 0 ? 'Needs attention' : 'All processed'}</div>
    </div>
    <div class="health-card">
      <div class="card-label">Wiki Pages</div>
      <div class="card-value">${wiki.totalPages}</div>
      <div class="card-detail">${Object.entries(wiki.typeCounts).map(([t,c]) => `${c} ${t}`).join(', ')}</div>
    </div>
    <div class="health-card">
      <div class="card-label">Queued Actions</div>
      <div class="card-value ${queueCount > 0 ? 'warn' : 'good'}">${queueCount}</div>
      <div class="card-detail">${queueCount > 0 ? `${queueCount} waiting for Claude` : 'Queue empty'}${queueCount > 0 ? ' <a onclick="clearQueue()" style="color:var(--red);cursor:pointer;margin-left:4px">clear</a>' : ''}</div>
    </div>
    <div class="health-card">
      <div class="card-label">Cloud Backup</div>
      <div class="card-value ${backup.lastBackup ? 'good' : ''}">${backup.lastBackup ? '&#10003;' : '&mdash;'}</div>
      <div class="card-detail">${backup.inProgress ? 'In progress...' : backup.lastBackup ? new Date(backup.lastBackup).toLocaleDateString() : 'Never'}</div>
    </div>
  `;

  // Vaults section
  const vaultsEl = document.getElementById('section-vaults');
  fetch('/api/vaults').then(r => r.json()).then(vaults => {
    vaultsEl.innerHTML = `
      <div class="manage-section-header">
        <h3>Vaults</h3>
        <span class="section-count">${vaults.length} vault${vaults.length !== 1 ? 's' : ''}</span>
      </div>
      <div style="padding:8px 16px;">
        ${vaults.map(v => `<span class="page-tag${v === activeVault ? ' type-tag' : ''}" style="margin:2px;cursor:pointer;" onclick="switchVault('${v}')">${v === 'default' ? 'Default' : v}</span>`).join('')}
      </div>
      <div style="display:flex;gap:8px;padding:8px 16px;">
        <input id="new-vault-name" class="chat-input" style="flex:1;padding:8px 14px;border-radius:8px;font-size:13px;" placeholder="New vault name..." autocomplete="off">
        <button class="manage-action-btn primary" onclick="createVault()">Create Vault</button>
      </div>
    `;
  });

  // Backup section
  const backupEl = document.getElementById('section-backup');
  backupEl.innerHTML = `
    <div class="manage-section-header">
      <h3>Cloud Backup</h3>
      <div class="manage-actions">
        ${backup.lastBackup ? `<span class="section-count">${backup.filesUploaded} files &middot; ${esc(backup.lastLabel)}</span>` : `<span class="section-count">${backup.bucket ? `gs://${esc(backup.bucket)}` : 'Not configured'}</span>`}
        <button class="manage-action-btn primary" onclick="triggerBackup()" ${backup.inProgress ? 'disabled' : ''}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M12 13v6"/><path d="m9 16 3-3 3 3"/></svg>
          ${backup.inProgress ? 'Backing up...' : 'Backup to GCS'}
        </button>
      </div>
    </div>
    ${backup.error ? `<div style="padding:8px 16px;color:var(--red);font-size:13px;">Error: ${esc(backup.error)}</div>` : ''}
  `;

  // Pending sources section
  const pendingEl = document.getElementById('section-pending');
  if (pendingCount > 0) {
    pendingEl.innerHTML = `
      <div class="manage-section-header">
        <h3>Pending Ingestion</h3>
        <div class="manage-actions">
          <span class="section-count">${pendingCount} files</span>
          <button class="manage-action-btn primary" onclick="queueIngestAll(${JSON.stringify(raw.pending).replace(/"/g, '&quot;')})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
            Ingest All
          </button>
        </div>
      </div>
      <div class="source-list">
        ${raw.pending.map(f => {
          const isQueued = queuedFiles.has(f);
          return `
          <div class="source-item">
            <div class="source-status pending"></div>
            <div class="source-info">
              <div class="source-filename">${esc(f)}</div>
              <div class="source-wiki-link">${isQueued ? 'Queued — Claude will process on next chat' : 'Not yet ingested'}</div>
            </div>
            ${isQueued
              ? '<span class="source-badge queued">Queued</span>'
              : `<button class="manage-action-btn secondary" onclick="queueIngest('${esc(f)}')" style="padding:4px 10px;font-size:11px">Ingest</button>`
            }
          </div>`;
        }).join('')}
      </div>
    `;
  } else {
    pendingEl.innerHTML = '';
  }

  // Ingested sources section
  const sourcesEl = document.getElementById('section-sources');
  sourcesEl.innerHTML = `
    <div class="manage-section-header">
      <h3>Ingested Sources</h3>
      <span class="section-count">${raw.ingested.length} files</span>
    </div>
    <div class="source-list">
      ${raw.ingested.map(s => `
        <div class="source-item">
          <div class="source-status ingested"></div>
          <div class="source-info">
            <div class="source-filename">${esc(s.rawFile)}</div>
            <div class="source-wiki-link">${s.wikiSlug ? `<a onclick="openPage('${esc(s.wikiSlug)}')">${esc(s.wikiTitle || s.wikiSlug)}</a>` : 'No wiki page linked'}</div>
          </div>
          <span class="source-badge done">Done</span>
        </div>
      `).join('')}
    </div>
  `;

  // Issues section
  const issuesEl = document.getElementById('section-issues');
  const issues = [];

  for (const bl of wiki.brokenLinks) {
    issues.push({ type: 'error', icon: 'link', msg: `Broken link: <strong>${esc(bl.from)}</strong> → <code>${esc(bl.to)}</code>` });
  }
  for (const orphan of wiki.orphans) {
    issues.push({ type: 'warn', icon: 'orphan', msg: `Orphan page: <strong>${esc(orphan)}</strong> — no inbound links` });
  }

  if (issues.length > 0) {
    issuesEl.innerHTML = `
      <div class="manage-section-header">
        <h3>Issues</h3>
        <div class="manage-actions">
          <span class="section-count">${issues.length} found</span>
          ${fixQueued
            ? '<span class="source-badge queued" style="font-size:11px;padding:5px 12px">Fix queued</span>'
            : `<button class="manage-action-btn primary" onclick="queueFixIssues()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Fix Issues
              </button>`
          }
        </div>
      </div>
      <div class="issue-list">
        ${issues.map(i => `
          <div class="issue-item ${i.type}">
            <svg class="issue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              ${i.icon === 'link'
                ? '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/><line x1="4" y1="4" x2="20" y2="20" stroke-opacity="0.5"/>'
                : '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'
              }
            </svg>
            <span>${i.msg}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    issuesEl.innerHTML = `
      <div class="manage-section-header">
        <h3>Issues</h3>
        <span class="section-count">0 found</span>
      </div>
      <div class="manage-empty">No issues found — wiki is healthy</div>
    `;
  }
}