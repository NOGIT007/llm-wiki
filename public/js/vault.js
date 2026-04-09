let activeVault = localStorage.getItem('activeVault') || 'default';

function api(path) {
  if (activeVault === 'default') return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}vault=${activeVault}`;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

async function loadVaults() {
  try {
    const vaults = await fetch('/api/vaults').then(r => r.json());
    const sel = document.getElementById('vault-select');
    sel.innerHTML = vaults.map(v =>
      `<option value="${v}"${v === activeVault ? ' selected' : ''}>${v === 'default' ? 'Default' : v}</option>`
    ).join('');
    sel.style.display = vaults.length > 1 ? '' : 'none';
  } catch {}
}

async function switchVault(name) {
  activeVault = name;
  localStorage.setItem('activeVault', name);
  currentSlug = null;
  chatHistory = JSON.parse(localStorage.getItem(getChatStorageKey()) || '[]');
  await init();
  showView('graph');
}

async function createVault() {
  const input = document.getElementById('new-vault-name');
  const name = input.value.trim();
  if (!name) return;
  const res = await fetch('/api/vaults', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (res.ok) {
    input.value = '';
    await loadVaults();
    showToast(`Vault "${name}" created`);
    loadManageView();
  }
}