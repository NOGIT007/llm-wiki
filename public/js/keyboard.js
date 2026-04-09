// ──────────────────────────────────────────────
// SINGLE GLOBAL KEYDOWN HANDLER (capture phase)
// ──────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  const inSearch = active === searchInput;
  const inTextInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA');

  // ── Add Source modal ──
  if (document.getElementById('add-overlay')?.classList.contains('active')) {
    if (e.key === 'Escape') { e.preventDefault(); closeAddSource(); }
    return; // Let all other keys through to modal inputs
  }

  // ── Search palette navigation ──
  if (isSearchOpen()) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (searchResultSlugs.length > 0) {
        searchSelectedIdx = Math.min(searchSelectedIdx + 1, searchResultSlugs.length - 1);
        updateSearchSelection();
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (searchResultSlugs.length > 0) {
        searchSelectedIdx = Math.max(searchSelectedIdx - 1, 0);
        updateSearchSelection();
      }
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (searchSelectedIdx >= 0) {
        selectSearchResult(searchResultSlugs[searchSelectedIdx]);
      } else if (searchResultSlugs.length > 0) {
        selectSearchResult(searchResultSlugs[0]);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
      return;
    }
    // Let typing through
    return;
  }

  // ── Sidebar navigation (works via .active class, no focus required) ──
  if (!inTextInput) {
    const items = [...document.querySelectorAll('.sidebar-item')];
    const activeItem = document.querySelector('.sidebar-item.active');
    const idx = activeItem ? items.indexOf(activeItem) : -1;

    if (e.key === 'ArrowDown' && items.length > 0) {
      e.preventDefault();
      const next = idx < items.length - 1 ? idx + 1 : 0;
      const slug = items[next]?.dataset.slug;
      if (slug) openPage(slug);
      items[next]?.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'ArrowUp' && items.length > 0) {
      e.preventDefault();
      const prev = idx > 0 ? idx - 1 : items.length - 1;
      const slug = items[prev]?.dataset.slug;
      if (slug) openPage(slug);
      items[prev]?.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter' && activeItem) {
      e.preventDefault();
      const slug = activeItem.dataset.slug;
      if (slug) openPage(slug);
      return;
    }
    if (e.key === 'Home' && items.length > 0) {
      e.preventDefault();
      const slug = items[0]?.dataset.slug;
      if (slug) openPage(slug);
      items[0]?.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'End' && items.length > 0) {
      e.preventDefault();
      const slug = items[items.length - 1]?.dataset.slug;
      if (slug) openPage(slug);
      items[items.length - 1]?.scrollIntoView({ block: 'nearest' });
      return;
    }
  }

  // ── Global shortcuts (not in text input) ──
  if (!inTextInput) {
    if (e.key === '/') {
      e.preventDefault();
      openSearch();
      return;
    }
    if (e.key === 'g' || e.key === 'G') {
      showView('graph');
      return;
    }
    if (e.key === 'Escape') {
      document.activeElement?.blur();
      return;
    }
    if ((e.altKey && e.key === 'ArrowLeft') || (!e.altKey && !e.ctrlKey && !e.metaKey && e.key === 'Backspace')) {
      if (pageHistory.length > 1) {
        e.preventDefault();
        pageHistory.pop();
        const prev = pageHistory.pop();
        openPage(prev);
      }
      return;
    }
  }

  // Cmd/Ctrl+K to open search (works everywhere)
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
    return;
  }
}, true);