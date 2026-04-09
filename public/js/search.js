const searchInput = document.getElementById('wiki-find');
const searchResults = document.getElementById('search-results');
const searchOverlay = document.getElementById('search-overlay');
let searchTimeout;
let searchSelectedIdx = -1;
let searchResultSlugs = [];

function isSearchOpen() {
  return searchOverlay.classList.contains('active');
}

function isSearchResultsActive() {
  return isSearchOpen() && searchResultSlugs.length > 0;
}

function openSearch() {
  searchOverlay.classList.add('active');
  searchInput.value = '';
  searchInput.focus();
  searchResults.innerHTML = '';
  searchSelectedIdx = -1;
  searchResultSlugs = [];
}

function closeSearch() {
  searchOverlay.classList.remove('active');
  searchSelectedIdx = -1;
  searchResultSlugs = [];
  searchInput.value = '';
}

function updateSearchSelection() {
  const items = searchResults.querySelectorAll('.search-result');
  items.forEach((el, i) => {
    el.classList.toggle('selected', i === searchSelectedIdx);
    if (i === searchSelectedIdx) el.scrollIntoView({ block: 'nearest' });
  });
}

function selectSearchResult(slug) {
  closeSearch();
  openPage(slug);
}

function doSearch() {
  clearTimeout(searchTimeout);
  searchSelectedIdx = -1;
  const q = searchInput.value.trim();
  if (!q) {
    searchResults.innerHTML = '';
    searchResultSlugs = [];
    return;
  }
  searchTimeout = setTimeout(async () => {
    const res = await fetch(api(`/api/search?q=${encodeURIComponent(q)}`));
    const results = await res.json();
    searchResultSlugs = results.slice(0, 15).map(r => r.slug);
    if (results.length === 0) {
      searchResults.innerHTML = '<div class="search-empty">No pages found</div>';
      searchResultSlugs = [];
    } else {
      searchResults.innerHTML = results.slice(0, 15).map((r, i) =>
        `<div class="search-result" data-idx="${i}" data-slug="${r.slug}" onmousedown="event.preventDefault();selectSearchResult('${r.slug}');">
          <span class="type-dot ${r.type}"></span>
          <span class="result-title">${r.title}</span>
          <span class="result-type">${r.type}</span>
        </div>`
      ).join('');
    }
  }, 120);
}

searchInput.addEventListener('input', doSearch);