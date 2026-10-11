// Add films by copying an object in this array. No browser storage is used.
const films = [
  {
    id: 'mukundan-unni-associates',
    title: 'Mukundan Unni Associates',
    description: 'Advocate Mukundan Unni, played by Vineeth Sreenivasan wants to be successful and leaves no stone unturned to achieve growth, prosperity, and respect. But this steadfast nature aided with an ample dose of greed comes with a cost.',
    year: '',
    language: 'Malayalam',
    genre: 'Dark comedy',
    poster: 'posters/Mukundan%20Unni%20Associates.jpg',
    trailer: 'trailer/mukundan-unni-associates.webm',
    addedAt: 1
  },
  {
    id: 'good-luck-have-fun-dont-die',
    title: 'Good Luck, Have Fun, Don’t Die',
    description: 'A “Man From the Future” arrives at a diner in Los Angeles where he must recruit the precise combination of disgruntled patrons to join him on a one-night quest to save the world from the terminal threat of a rogue artificial intelligence. A dystopian satire with gonzo adventure.',
    year: '',
    language: 'English',
    genre: 'Sci-Fi · Comedy · Action',
    poster: 'posters/GOOD LUCK, HAVE FUN, DON\'T DIE.png',
    trailer: 'trailer/good-luck-have-fun-dont-die.webm',
    addedAt: 2
  }
];

const grid = document.querySelector('#film-grid');
const hero = document.querySelector('#featured');
const count = document.querySelector('#film-count');
const search = document.querySelector('#search');
const empty = document.querySelector('#empty-state');
const detailDialog = document.querySelector('#detail-dialog');
const posterDialog = document.querySelector('#poster-dialog');
const languageTabs = document.querySelector('#language-tabs');
const sortButton = document.querySelector('#sort-button');
const FALLBACK_POSTER = 'posters/fallback-landscape.svg';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const pad = value => String(value).padStart(2, '0');
const posterOf = film => film.poster || FALLBACK_POSTER;
const metaOf = film => [film.language || 'Other', film.genre || 'Film', film.year].filter(Boolean).map(escapeHtml).join(' · ');
const indexOf = film => [...films].sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0)).indexOf(film) + 1;
let newestFirst = true;
let selectedLanguage = 'All';

function renderHero() {
  const film = [...films].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))[0];
  if (!film) { hero.hidden = true; return; }
  hero.innerHTML = `<img class="hero-backdrop" src="${escapeHtml(posterOf(film))}" alt="" aria-hidden="true">
    <div class="hero-inner">
      <p class="eyebrow"><span class="pulse" aria-hidden="true"></span>Now showing · Nº ${pad(indexOf(film))}</p>
      <h1 class="hero-title">${escapeHtml(film.title)}</h1>
      <p class="hero-meta">${metaOf(film)}</p>
      <p class="hero-copy">${escapeHtml(film.description || 'A film in my collection.')}</p>
      <div class="hero-actions">
        <button class="btn btn-primary" type="button" data-watch-trailer="${escapeHtml(film.id)}"><span class="play-glyph" aria-hidden="true"></span>Play trailer</button>
        <button class="btn btn-ghost" type="button" data-open-poster="${escapeHtml(film.id)}">View poster</button>
      </div>
    </div>
    <div class="sprockets" aria-hidden="true"></div>`;
  bindActions(hero);
}

function render() {
  const languages = [...new Set(films.map(film => film.language || 'Other'))].sort((a, b) => a.localeCompare(b));
  if (selectedLanguage !== 'All' && !languages.includes(selectedLanguage)) selectedLanguage = 'All';
  const languageMatches = films.filter(film => selectedLanguage === 'All' || (film.language || 'Other') === selectedLanguage);
  languageTabs.innerHTML = ['All', ...languages].map(language => {
    const total = language === 'All' ? films.length : films.filter(film => (film.language || 'Other') === language).length;
    return `<button class="language-tab${selectedLanguage === language ? ' is-active' : ''}" type="button" role="tab" aria-selected="${selectedLanguage === language}" data-language="${escapeHtml(language)}">${escapeHtml(language)} <span>${pad(total)}</span></button>`;
  }).join('');
  languageTabs.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    selectedLanguage = button.dataset.language;
    render();
  }));

  const query = search.value.trim().toLowerCase();
  const matches = languageMatches.filter(film => `${film.title} ${film.description} ${film.genre} ${film.language}`.toLowerCase().includes(query));
  const visibleFilms = [...matches].sort((a, b) => newestFirst ? (b.addedAt || 0) - (a.addedAt || 0) : (a.addedAt || 0) - (b.addedAt || 0));
  count.textContent = `(${pad(languageMatches.length)})`;
  empty.hidden = visibleFilms.length > 0;
  grid.innerHTML = visibleFilms.map((film, i) => `<article class="film-card" style="--i:${i}">
    <div class="poster">
      <button class="poster-play" type="button" data-watch-trailer="${escapeHtml(film.id)}" aria-label="Play ${escapeHtml(film.title)} trailer">
        <img src="${escapeHtml(posterOf(film))}" alt="${escapeHtml(film.poster ? `${film.title} poster` : `Artwork placeholder for ${film.title}`)}" loading="lazy">
        <span class="play-badge" aria-hidden="true"><span class="play-glyph"></span></span>
      </button>
      <span class="poster-chip">${escapeHtml(film.language || 'Other')}</span>
      <button class="poster-expand" type="button" data-open-poster="${escapeHtml(film.id)}" aria-label="View ${escapeHtml(film.title)} poster full size">⤢</button>
    </div>
    <div class="film-body">
      <div class="film-meta"><span>${escapeHtml(film.genre || 'Film')}</span><span class="film-index">Nº ${pad(indexOf(film))}</span></div>
      <h3 class="film-title">${escapeHtml(film.title)}</h3>
      <p class="film-note">${escapeHtml(film.description || 'A film in my collection.')}</p>
      <button class="watch-trailer-button" type="button" data-watch-trailer="${escapeHtml(film.id)}">Watch trailer <span aria-hidden="true">→</span></button>
    </div>
  </article>`).join('');
  bindActions(grid);
}

function bindActions(root) {
  root.querySelectorAll('[data-open-poster]').forEach(button => button.addEventListener('click', () => showPoster(button.dataset.openPoster)));
  root.querySelectorAll('[data-watch-trailer]').forEach(button => button.addEventListener('click', () => showDetail(button.dataset.watchTrailer)));
}

function showPoster(id) {
  const film = films.find(item => item.id === id);
  if (!film) return;
  const preview = document.querySelector('#poster-preview');
  preview.src = posterOf(film);
  preview.alt = `${film.title} poster`;
  posterDialog.showModal();
}

function showDetail(id) {
  const film = films.find(item => item.id === id);
  if (!film) return;
  const video = toEmbed(film.trailer);
  const localPlayer = isLocalVideo(film.trailer) ? `<video class="trailer-frame" src="${escapeHtml(film.trailer)}" poster="${escapeHtml(posterOf(film))}" controls autoplay playsinline></video>` : '';
  const player = localPlayer || (video ? `<iframe class="trailer-frame" src="${escapeHtml(video)}" title="${escapeHtml(film.title)} trailer" allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>` : '');
  const fallbackLink = !localPlayer && film.trailer ? `<a class="trailer-link" target="_blank" rel="noopener" href="${escapeHtml(film.trailer)}">${video ? 'If it doesn’t start, open the trailer' : 'Open trailer'} ↗</a>` : '';
  detailDialog.style.setProperty('--backdrop', `url("${posterOf(film).replace(/"/g, '%22')}")`);
  document.querySelector('#detail-content').innerHTML = `${player}
    <div class="detail-info">
      <div>
        <p class="eyebrow">${metaOf(film)}</p>
        <h2>${escapeHtml(film.title)}</h2>
        ${fallbackLink}
      </div>
      <p class="detail-copy">${escapeHtml(film.description || 'A film in my collection.')}</p>
    </div>`;
  detailDialog.showModal();
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
detailDialog.addEventListener('close', () => { document.querySelector('#detail-content').innerHTML = ''; });
document.querySelector('#close-poster').addEventListener('click', () => posterDialog.close());
posterDialog.addEventListener('click', event => { if (event.target === posterDialog) posterDialog.close(); });
posterDialog.addEventListener('close', () => { document.querySelector('#poster-preview').removeAttribute('src'); });
search.addEventListener('input', render);
document.addEventListener('keydown', event => {
  if (event.key !== '/' || document.querySelector('dialog[open]') || /^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName)) return;
  event.preventDefault();
  search.focus();
});
sortButton.addEventListener('click', () => {
  newestFirst = !newestFirst;
  sortButton.innerHTML = `${newestFirst ? 'Recently added' : 'Oldest added'} <span aria-hidden="true">↕</span>`;
  render();
});
const topbar = document.querySelector('.topbar');
const onScroll = () => topbar.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
renderHero();
render();
