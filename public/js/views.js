function showView(view) {
  document.getElementById('graph-view').classList.toggle('active', view === 'graph');
  document.getElementById('page-view').classList.toggle('active', view === 'page');
  document.getElementById('chat-view').classList.toggle('active', view === 'chat');
  document.getElementById('manage-view').classList.toggle('active', view === 'manage');
  // Show welcome if page view selected but no page loaded
  const showWelcome = view === 'page' && !currentSlug;
  document.getElementById('welcome').classList.toggle('active', showWelcome);
  if (showWelcome) document.getElementById('page-view').classList.remove('active');
  document.getElementById('btn-graph').classList.toggle('active', view === 'graph');
  document.getElementById('btn-page').classList.toggle('active', view === 'page');
  document.getElementById('btn-chat').classList.toggle('active', view === 'chat');
  document.getElementById('btn-manage').classList.toggle('active', view === 'manage');
  if (view === 'graph') resizeCanvas();
  if (view === 'chat') initChatView();
  if (view === 'manage') loadManageView();
}

document.getElementById('btn-graph').addEventListener('click', () => showView('graph'));
document.getElementById('btn-page').addEventListener('click', () => showView('page'));
document.getElementById('btn-chat').addEventListener('click', () => showView('chat'));
document.getElementById('btn-manage').addEventListener('click', () => showView('manage'));