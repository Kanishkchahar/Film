// Add films by copying an object in this array. No browser storage is used.
const films = [
  {
    id: 'mukundan-unni-associates',
    title: 'Mukundan Unni Associates',
    description: 'Advocate Mukundan Unni, played by Vineeth Sreenivasan wants to be successful and leaves no stone unturned to achieve growth, prosperity, and respect. But this steadfast nature aided with an ample dose of greed comes with a cost.',
    year: '2022',
    director: 'Abhinav Sunder Nayak',
    runtime: '127m',
    language: 'Malayalam',
    genre: 'Dark comedy',
    poster: 'posters/mukundan-unni-associates.jpg',
    trailer: 'trailer/mukundan-unni-associates.webm',
    addedAt: 1
  },
  {
    id: 'good-luck-have-fun-dont-die',
    title: 'Good Luck, Have Fun, Don’t Die',
    description: 'A “Man From the Future” arrives at a diner in Los Angeles where he must recruit the precise combination of disgruntled patrons to join him on a one-night quest to save the world from the terminal threat of a rogue artificial intelligence. A dystopian satire with gonzo adventure.',
    year: '2025',
    director: 'Gore Verbinski',
    runtime: 'Feature',
    language: 'English',
    genre: 'Sci-Fi · Comedy · Action',
    poster: 'posters/good-luck-have-fun-dont-die.jpg',
    trailer: 'trailer/good-luck-have-fun-dont-die.webm',
    addedAt: 2
  }
];

const grid = document.querySelector('#film-grid');
const count = document.querySelector('#film-count');
const search = document.querySelector('#search');
const empty = document.querySelector('#empty-state');
const detailDialog = document.querySelector('#detail-dialog');
const posterDialog = document.querySelector('#poster-dialog');
const languageTabs = document.querySelector('#language-tabs');
const sortButton = document.querySelector('#sort-button');
const surpriseButton = document.querySelector('#surprise-button');
const FALLBACK_POSTER = 'posters/fallback-landscape.svg';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const pad = value => String(value).padStart(2, '0');
const posterOf = film => film.poster || FALLBACK_POSTER;
const metaOf = film => [film.year, film.language || 'Other', film.genre || 'Film', film.runtime, film.director ? `Dir. ${film.director}` : ''].filter(Boolean).map(escapeHtml).join(' · ');
const indexOf = film => [...films].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0)).indexOf(film) + 1;
let newestFirst = true;
let selectedLanguage = 'All';
let animateCards = true;
let dialogOpener = null;
let currentDetailFilmId = null;
let lastVisibleFilms = [];
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function updateStructuredData() {
  let script = document.querySelector('#film-schema');
  if (!script) {
    script = document.createElement('script');
    script.id = 'film-schema';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Film — A Personal Archive',
    'description': 'A quiet, warm shelf of films worth keeping.',
    'numberOfItems': films.length,
    'itemListElement': films.map((film, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'item': {
        '@type': 'Movie',
        'name': film.title,
        'description': film.description,
        'image': film.poster,
        'inLanguage': film.language,
        'genre': film.genre,
        ...(film.year ? { 'dateCreated': String(film.year) } : {}),
        ...(film.director ? { 'director': { '@type': 'Person', 'name': film.director } } : {})
      }
    }))
  };
  script.textContent = JSON.stringify(data);
}

function render() {
  const languages = [...new Set(films.map(film => film.language || 'Other'))].sort((a, b) => a.localeCompare(b));
  if (selectedLanguage !== 'All' && !languages.includes(selectedLanguage)) selectedLanguage = 'All';
  const languageMatches = films.filter(film => selectedLanguage === 'All' || (film.language || 'Other') === selectedLanguage);
  languageTabs.innerHTML = ['All', ...languages].map(language => {
    const total = language === 'All' ? films.length : films.filter(film => (film.language || 'Other') === language).length;
    const tabId = `tab-${language === 'All' ? 'all' : normalize(language).replace(/[^a-z0-9]+/g, '-')}`;
    return `<button id="${tabId}" class="language-tab${selectedLanguage === language ? ' is-active' : ''}" type="button" role="tab" tabindex="${selectedLanguage === language ? 0 : -1}" aria-controls="film-grid" aria-selected="${selectedLanguage === language}" data-language="${escapeHtml(language)}">${escapeHtml(language)} <span>${pad(total)}</span></button>`;
  }).join('');
  grid.setAttribute('aria-labelledby', languageTabs.querySelector('.is-active').id);
  const tabs = [...languageTabs.querySelectorAll('[data-language]')];
  const activateTab = button => {
    selectedLanguage = button.dataset.language;
    animateCards = true;
    render();
    languageTabs.querySelector('.is-active')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  };
  tabs.forEach(button => {
    button.addEventListener('click', () => activateTab(button));
    button.addEventListener('keydown', event => {
      const at = tabs.indexOf(button);
      const next = event.key === 'ArrowRight' ? (at + 1) % tabs.length : event.key === 'ArrowLeft' ? (at - 1 + tabs.length) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault();
      activateTab(tabs[next]);
      languageTabs.querySelector('.is-active')?.focus();
    });
  });

  const query = normalize(search.value.trim());
  const matches = languageMatches.filter(film => normalize(`${film.title} ${film.genre} ${film.language} ${film.year || ''} ${film.director || ''}`).includes(query));
  const visibleFilms = [...matches].sort((a, b) => newestFirst ? (b.addedAt || 0) - (a.addedAt || 0) : (a.addedAt || 0) - (b.addedAt || 0));
  lastVisibleFilms = visibleFilms;
  count.textContent = `(${pad(visibleFilms.length)})`;
  count.setAttribute('aria-label', `${visibleFilms.length} ${visibleFilms.length === 1 ? 'film' : 'films'} shown`);
  empty.hidden = visibleFilms.length > 0;
  grid.innerHTML = visibleFilms.map((film, i) => `<article class="film-card${animateCards ? ' card-enter' : ''}" aria-labelledby="title-${escapeHtml(film.id)}" style="--i:${i}">
    <div class="poster">
      <button class="poster-play" type="button" data-watch-trailer="${escapeHtml(film.id)}" aria-label="Play trailer — ${escapeHtml(film.title)}">
        <img src="${escapeHtml(posterOf(film))}" alt="${escapeHtml(`${film.title} — key art`)}" loading="lazy" decoding="async" width="1280" height="720">
        <span class="play-badge" aria-hidden="true"><span class="play-glyph"></span></span>
      </button>
      <span class="poster-chip">${escapeHtml(film.language || 'Other')}</span>
      <button class="poster-expand" type="button" data-open-poster="${escapeHtml(film.id)}" aria-label="View poster — ${escapeHtml(film.title)}">⤢</button>
    </div>
    <div class="film-body">
      <div class="film-meta"><span>${escapeHtml(film.genre || 'Film')}</span><span class="film-index">Nº ${pad(indexOf(film))}</span></div>
      <h2 class="film-title" id="title-${escapeHtml(film.id)}">${escapeHtml(film.title)}</h2>
      <p class="film-note">${escapeHtml(film.description || 'A film in my collection.')}</p>
      <button class="watch-trailer-button" type="button" data-watch-trailer="${escapeHtml(film.id)}" aria-label="Watch trailer — ${escapeHtml(film.title)}">Watch trailer <span aria-hidden="true">→</span></button>
    </div>
  </article>`).join('');
  bindActions(grid);
  animateCards = false;
  updateStructuredData();
}

function bindActions(root) {
  root.querySelectorAll('[data-open-poster]').forEach(button => button.addEventListener('click', () => showPoster(button.dataset.openPoster)));
  root.querySelectorAll('[data-watch-trailer]').forEach(button => button.addEventListener('click', () => showDetail(button.dataset.watchTrailer)));
}

function showPoster(id) {
  const film = films.find(item => item.id === id);
  if (!film) return;
  const preview = document.querySelector('#poster-preview');
  dialogOpener = document.activeElement;
  preview.src = posterOf(film);
  preview.alt = `${film.title} poster`;
  posterDialog.setAttribute('aria-label', `${film.title} poster`);
  posterDialog.showModal();
}

function showDetail(id) {
  const film = films.find(item => item.id === id);
  if (!film) return;
  currentDetailFilmId = id;
  const navPool = lastVisibleFilms.length ? lastVisibleFilms : films;
  const currentIndex = Math.max(0, navPool.findIndex(item => item.id === id));
  const prevFilm = navPool[(currentIndex - 1 + navPool.length) % navPool.length];
  const nextFilm = navPool[(currentIndex + 1) % navPool.length];
  const video = toEmbed(film.trailer);
  if (!detailDialog.open) dialogOpener = document.activeElement;
  const localPlayer = isLocalVideo(film.trailer) ? `<video class="trailer-frame" data-src="${escapeHtml(film.trailer)}" poster="${escapeHtml(posterOf(film))}" controls autoplay playsinline preload="none"></video>` : '';
  const player = localPlayer || (video ? `<iframe class="trailer-frame" src="${escapeHtml(video)}" title="${escapeHtml(film.title)} — trailer" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : '');
  const fallbackLink = !localPlayer && film.trailer ? `<a class="trailer-link" target="_blank" rel="noopener" href="${escapeHtml(film.trailer)}">${video ? 'If it doesn’t start, open trailer' : 'Open trailer'} ↗</a>` : '';
  detailDialog.style.setProperty('--backdrop', `url("${posterOf(film).replace(/"/g, '%22')}")`);
  const content = document.querySelector('#detail-content');
  content.innerHTML = `${player}
    <div class="detail-info">
      <div class="detail-body">
        <div class="detail-primary">
          <p class="eyebrow">${metaOf(film)}</p>
          <h2 id="detail-title">${escapeHtml(film.title)}</h2>
          <div class="detail-actions">
            <button class="copy-link-btn" id="copy-film-link" type="button" aria-label="Copy link to this film"><span class="copy-glyph" aria-hidden="true">⎘</span> <span class="copy-label">Copy link</span></button>
            ${fallbackLink}
          </div>
        </div>
        <p class="detail-copy">${escapeHtml(film.description || 'A film in my collection.')}</p>
      </div>
      <div class="detail-nav" aria-label="Browse shelf">
        <button class="detail-nav-btn" type="button" data-nav-film="${escapeHtml(prevFilm.id)}" aria-label="Previous film: ${escapeHtml(prevFilm.title)}">← Prev</button>
        <span class="detail-nav-counter">Nº ${pad(currentIndex + 1)} / ${pad(navPool.length)}</span>
        <button class="detail-nav-btn" type="button" data-nav-film="${escapeHtml(nextFilm.id)}" aria-label="Next film: ${escapeHtml(nextFilm.title)}">Next →</button>
      </div>
    </div>`;
  detailDialog.removeAttribute('aria-label');
  detailDialog.setAttribute('aria-labelledby', 'detail-title');
  const localVideo = content.querySelector('video');
  if (localVideo) localVideo.src = localVideo.dataset.src;

  content.querySelectorAll('[data-nav-film]').forEach(btn => {
    btn.addEventListener('click', () => showDetail(btn.dataset.navFilm));
  });

  const copyBtn = content.querySelector('#copy-film-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const url = `${location.origin}${location.pathname}#${encodeURIComponent(film.id)}`;
      try {
        await navigator.clipboard.writeText(url);
        copyBtn.classList.add('is-copied');
        const label = copyBtn.querySelector('.copy-label');
        if (label) label.textContent = 'Link copied ✓';
        setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          const lbl = copyBtn.querySelector('.copy-label');
          if (lbl) lbl.textContent = 'Copy link';
        }, 2000);
      } catch {
        prompt('Copy link:', url);
      }
    });
  }

  history.replaceState(null, '', `#${encodeURIComponent(film.id)}`);
  if (!detailDialog.open) detailDialog.showModal();
}

function isLocalVideo(value) { return /\.(?:mp4|webm|ogg)(?:[?#].*)?$/i.test(value || ''); }

function toEmbed(value) {
  try {
    const url = new URL(value);
    if (url.hostname.includes('youtu.be')) return `https://www.youtube.com/embed/${url.pathname.slice(1)}?autoplay=1&mute=1&playsinline=1`;
    if (url.hostname.includes('youtube.com')) {
      const id = url.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&playsinline=1`;
      if (url.pathname.startsWith('/embed/')) return `${value}${value.includes('?') ? '&' : '?'}autoplay=1&mute=1&playsinline=1`;
    }
    if (url.hostname.includes('vimeo.com')) {
      const id = url.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1`;
    }
  } catch { return ''; }
  return '';
}

document.querySelector('#close-detail').addEventListener('click', () => detailDialog.close());
detailDialog.addEventListener('click', event => { if (event.target === detailDialog) detailDialog.close(); });
detailDialog.addEventListener('close', () => {
  const video = document.querySelector('#detail-content video');
  if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
  document.querySelector('#detail-content').innerHTML = '';
  currentDetailFilmId = null;
  if (location.hash) history.replaceState(null, '', `${location.pathname}${location.search}`);
  dialogOpener?.focus();
});

document.querySelector('#close-poster').addEventListener('click', () => posterDialog.close());
posterDialog.addEventListener('click', event => { if (event.target === posterDialog) posterDialog.close(); });
posterDialog.addEventListener('close', () => {
  document.querySelector('#poster-preview').removeAttribute('src');
  dialogOpener?.focus();
});

search.addEventListener('input', () => { animateCards = false; render(); });
search.addEventListener('keydown', event => {
  if (event.key === 'Escape' && search.value) {
    event.preventDefault();
    search.value = '';
    animateCards = false;
    render();
  }
});

document.addEventListener('keydown', event => {
  if (detailDialog.open) {
    const pool = lastVisibleFilms.length ? lastVisibleFilms : films;
    const idx = pool.findIndex(f => f.id === currentDetailFilmId);
    if (event.key === 'ArrowLeft' && idx >= 0) {
      event.preventDefault();
      const prev = pool[(idx - 1 + pool.length) % pool.length];
      showDetail(prev.id);
    } else if (event.key === 'ArrowRight' && idx >= 0) {
      event.preventDefault();
      const next = pool[(idx + 1) % pool.length];
      showDetail(next.id);
    }
    return;
  }
  if (event.key !== '/' || document.querySelector('dialog[open]') || /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName)) return;
  event.preventDefault();
  search.focus();
});

sortButton.addEventListener('click', () => {
  newestFirst = !newestFirst;
  sortButton.innerHTML = `${newestFirst ? 'Recently added' : 'Oldest added'} <span aria-hidden="true">↕</span>`;
  animateCards = false;
  render();
});

surpriseButton?.addEventListener('click', () => {
  const pool = lastVisibleFilms.length ? lastVisibleFilms : films;
  if (!pool.length) return;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  showDetail(picked.id);
});

const topbar = document.querySelector('.topbar');
const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
render();

const openHashFilm = () => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (films.some(film => film.id === id)) showDetail(id);
};
if (location.hash) openHashFilm();
window.addEventListener('hashchange', () => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (films.some(film => film.id === id)) showDetail(id);
  else if (detailDialog.open) detailDialog.close();
});
