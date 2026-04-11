let selectedFile = null;

function openAddSource() {
  document.getElementById('add-overlay').classList.add('active');
  switchAddTab('paste');
  clearAddStatus();
}

function closeAddSource() {
  document.getElementById('add-overlay').classList.remove('active');
  clearAddStatus();
  document.getElementById('paste-filename').value = '';
  document.getElementById('paste-content').value = '';
  document.getElementById('url-input').value = '';
  document.getElementById('url-filename').value = '';
  document.getElementById('url-crawl').checked = false;
  clearFile();
}

async function autoQueueAndSwitch(filename) {
  await fetch(api('/api/queue'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ action: 'ingest', target: filename }),
  });
  // Close modal and switch to manage view after brief delay
  setTimeout(() => {
    closeAddSource();
    showView('manage');
    showToast(`${filename} saved and queued for ingestion`);
  }, 800);
}

function switchAddTab(tab) {
  document.querySelectorAll('.add-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.add-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
  clearAddStatus();
}

function clearAddStatus() {
  document.querySelectorAll('.add-status').forEach(s => { s.className = 'add-status'; s.textContent = ''; });
}

function showStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.className = `add-status ${type}`;
  el.textContent = msg;
}

async function submitPaste() {
  const filename = document.getElementById('paste-filename').value.trim();
  const content = document.getElementById('paste-content').value;
  if (!filename) { showStatus('paste-status', 'Please enter a filename.', 'error'); return; }
  if (!content) { showStatus('paste-status', 'Please paste some content.', 'error'); return; }

  try {
    const res = await fetch(api('/api/raw'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ filename, content }),
    });
    const data = await res.json();
    if (data.ok) {
      showStatus('paste-status', `Saved as raw/${data.filename}`, 'success');
      document.getElementById('paste-filename').value = '';
      document.getElementById('paste-content').value = '';
      await autoQueueAndSwitch(data.filename);
    } else {
      showStatus('paste-status', data.error || 'Save failed', 'error');
    }
  } catch (err) {
    showStatus('paste-status', 'Network error', 'error');
  }
}

function handleFileSelect(input) {
  const file = input.files?.[0];
  if (!file) return;
  selectedFile = file;
  document.getElementById('file-name').textContent = file.name;
  document.getElementById('file-info').classList.add('has-file');
  document.getElementById('upload-btn').disabled = false;
  document.getElementById('drop-zone').style.display = 'none';
}

function clearFile() {
  selectedFile = null;
  document.getElementById('file-input').value = '';
  document.getElementById('file-info').classList.remove('has-file');
  document.getElementById('upload-btn').disabled = true;
  document.getElementById('drop-zone').style.display = '';
}

async function submitUpload() {
  if (!selectedFile) return;
  const form = new FormData();
  form.append('file', selectedFile);

  try {
    const res = await fetch(api('/api/raw'), { method: 'POST', body: form });
    const data = await res.json();
    if (data.ok) {
      showStatus('upload-status', `Uploaded as raw/${data.filename}`, 'success');
      clearFile();
      await autoQueueAndSwitch(data.filename);
    } else {
      showStatus('upload-status', data.error || 'Upload failed', 'error');
    }
  } catch (err) {
    showStatus('upload-status', 'Network error', 'error');
  }
}

async function submitUrl() {
  const url = document.getElementById('url-input').value.trim();
  const filename = document.getElementById('url-filename').value.trim();
  const crawl = document.getElementById('url-crawl').checked;
  if (!url) { showStatus('url-status', 'Please enter a URL.', 'error'); return; }

  showStatus('url-status', crawl ? 'Fetching and crawling...' : 'Fetching...', '');
  try {
    const res = await fetch(api('/api/raw'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url, filename: filename || undefined, crawl }),
    });
    const data = await res.json();
    if (data.ok) {
      const filenames = data.filenames || [data.filename];
      showStatus('url-status', `Saved ${filenames.length} file(s)`, 'success');
      document.getElementById('url-input').value = '';
      document.getElementById('url-filename').value = '';
      document.getElementById('url-crawl').checked = false;
      for (const f of filenames) {
        await fetch(api('/api/queue'), {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'ingest', target: f }),
        });
      }
      setTimeout(() => {
        closeAddSource();
        showView('manage');
        showToast(`${filenames.length} source(s) saved and queued for ingestion`);
      }, 800);
    } else {
      showStatus('url-status', data.error || 'Fetch failed', 'error');
    }
  } catch (err) {
    showStatus('url-status', 'Network error', 'error');
  }
}

// Drag and drop support
const dropZone = document.getElementById('drop-zone');
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    selectedFile = file;
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-info').classList.add('has-file');
    document.getElementById('upload-btn').disabled = false;
    dropZone.style.display = 'none';
  }
});

init();
checkStatus();
loadConfig();