function getChatStorageKey() { return `wiki-chat-history-${activeVault}`; }
let chatHistory = JSON.parse(localStorage.getItem(getChatStorageKey()) || '[]');
let chatBusy = false;

const CHAT_SUGGESTIONS = [
  'What entities are in the wiki?',
  'Summarize AI security risks',
  'How does Jevons Paradox apply to AI?',
  'What is the 4D Framework?',
  'Compare Claude Code vs Claude Desktop',
  'What prompt engineering techniques exist?',
  'List all sources about NotebookLM',
];

function initChatView() {
  loadChatModels();
  renderChatSuggestions();
  renderChatRecent();
  document.getElementById('chat-input').focus();
}

async function loadChatModels() {
  try {
    const data = await fetch('/api/chat/models').then(r => r.json());
    const sel = document.getElementById('chat-model-select');
    if (!sel || !data.models?.length) return;
    sel.innerHTML = data.models.map(m =>
      `<option value="${m.id}"${m.id === data.default ? ' selected' : ''}>${m.label}</option>`
    ).join('');
  } catch {}
}

async function saveChatModel(model) {
  await fetch('/api/config', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chatModel: model }),
  });
}

function renderChatSuggestions() {
  document.getElementById('chat-suggestions').innerHTML = CHAT_SUGGESTIONS.map(s =>
    `<button class="chat-chip" onclick="askChatWith('${s.replace(/'/g, "\\'")}')"><span class="chip-arrow">&#9656;</span> ${s}</button>`
  ).join('');
}

function renderChatRecent() {
  const el = document.getElementById('chat-recent');
  if (chatHistory.length === 0) { el.innerHTML = ''; return; }
  const recent = chatHistory.slice(-5).reverse();
  el.innerHTML = `
    <div class="chat-recent-header">Recent Queries</div>
    ${recent.map(h => `
      <div class="chat-recent-item" onclick="askChatWith('${h.question.replace(/'/g, "\\'")}')">
        <span>${h.question}</span>
        <span class="chat-recent-time">${formatChatTime(h.timestamp)}</span>
      </div>
    `).join('')}
  `;
}

function formatChatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function askChatWith(question) {
  document.getElementById('chat-input').value = question;
  askChat();
}

async function askChat() {
  const input = document.getElementById('chat-input');
  const question = input.value.trim();
  if (!question || chatBusy) return;

  chatBusy = true;
  input.value = '';
  document.getElementById('chat-ask-btn').disabled = true;

  document.getElementById('chat-landing').classList.add('hidden');
  const results = document.getElementById('chat-results');
  results.classList.add('active');
  results.innerHTML = `
    <div class="chat-q">${esc(question)}</div>
    <div class="chat-thinking">
      <div class="dots"><span></span><span></span><span></span></div>
      Searching wiki and thinking...
    </div>
  `;

  try {
    const res = await fetch(api('/api/chat'), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message: question, model: document.getElementById('chat-model-select')?.value }),
    });
    const data = await res.json();

    if (data.error) {
      results.innerHTML = `
        <div class="chat-q">${esc(question)}</div>
        <div class="chat-answer" style="color:var(--red)">${esc(data.error)}</div>
      `;
    } else {
      const rendered = renderMarkdown(data.answer);
      const sourceTags = (data.sources || []).map(slug => {
        const page = allPages.find(p => p.slug === slug);
        const title = page ? page.title : slug;
        return `<a class="chat-source-tag" onclick="openPage('${esc(slug)}')">${esc(title)}</a>`;
      }).join('');

      const modelBadge = data.model ? `<div class="chat-model-badge">Answered by ${esc(data.model)}</div>` : '';
      results.innerHTML = `
        <div class="chat-q">${esc(question)}</div>
        <div class="chat-answer">${rendered}</div>
        ${modelBadge}
        ${sourceTags ? `<div class="chat-sources"><span class="chat-sources-label">Sources consulted</span>${sourceTags}</div>` : ''}
      `;

      chatHistory.push({ question, timestamp: new Date().toISOString() });
      if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
      localStorage.setItem(getChatStorageKey(), JSON.stringify(chatHistory));
    }
  } catch (err) {
    results.innerHTML = `
      <div class="chat-q">${esc(question)}</div>
      <div class="chat-answer" style="color:var(--red)">Failed to connect. Is the server running?</div>
    `;
  }

  chatBusy = false;
  document.getElementById('chat-ask-btn').disabled = false;
}

function clearChat() {
  document.getElementById('chat-results').classList.remove('active');
  document.getElementById('chat-results').innerHTML = '';
  document.getElementById('chat-landing').classList.remove('hidden');
  document.getElementById('chat-input').value = '';
  renderChatRecent();
  document.getElementById('chat-input').focus();
}

document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askChat(); }
});