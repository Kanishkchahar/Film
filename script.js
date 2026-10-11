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
const count = document.querySelector('#film-count');
const search = document.querySelector('#search');
const empty = document.querySelector('#empty-state');
const detailDialog = document.querySelector('#detail-dialog');
const languageTabs = document.querySelector('#language-tabs');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let newestFirst = true;
let selectedLanguage = 'All';

function render() {
  const languages = [...new Set(films.map(film => film.language || 'Other'))].sort((a, b) => a.localeCompare(b));
  if (selectedLanguage !== 'All' && !languages.includes(selectedLanguage)) selectedLanguage = 'All';
  const languageMatches = films.filter(film => selectedLanguage === 'All' || (film.language || 'Other') === selectedLanguage);
  languageTabs.innerHTML = ['All', ...languages].map(language => {
    const total = language === 'All' ? films.length : languages.length && films.filter(film => (film.language || 'Other') === language).length;
    return `<button class="language-tab${selectedLanguage === language ? ' is-active' : ''}" type="button" role="tab" aria-selected="${selectedLanguage === language}" data-language="${escapeHtml(language)}">${escapeHtml(language)} <span>${String(total).padStart(2, '0')}</span></button>`;
  }).join('');
  languageTabs.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    selectedLanguage = button.dataset.language;
    render();
  }));

  const query = search.value.trim().toLowerCase();
  const matches = languageMatches.filter(film => `${film.title} ${film.description} ${film.genre} ${film.language}`.toLowerCase().includes(query));
  const visibleFilms = [...matches].sort((a, b) => newestFirst ? (b.addedAt || 0) - (a.addedAt || 0) : (a.addedAt || 0) - (b.addedAt || 0));
  count.textContent = `(${String(languageMatches.length).padStart(2, '0')})`;
  empty.hidden = visibleFilms.length > 0;
  grid.innerHTML = visibleFilms.map(film => `<article class="film-card">
    <button class="poster" type="button" data-open-poster="${escapeHtml(film.id)}" aria-label="View ${escapeHtml(film.title)} poster"><img src="${escapeHtml(film.poster || 'posters/fallback-landscape.svg')}" alt="${escapeHtml(film.poster ? `${film.title} poster` : `Artwork placeholder for ${film.title}`)}" loading="lazy"></button>
    <div class="film-meta"><span>${escapeHtml(film.language || 'Other')} · ${escapeHtml(film.genre || 'FILM')}</span><span>${escapeHtml(film.year || '')}</span></div>
    <h3 class="film-title">${escapeHtml(film.title)}</h3><p class="film-note">${escapeHtml(film.description || 'A film in my collection.')}</p>
    <button class="watch-trailer-button" type="button" data-watch-trailer="${escapeHtml(film.id)}">Watch trailer <span>↗</span></button>
  </article>`).join('');
  grid.querySelectorAll('[data-open-poster]').forEach(button => button.addEventListener('click', () => showPoster(button.dataset.openPoster)));
  grid.querySelectorAll('[data-watch-trailer]').forEach(button => button.addEventListener('click', () => showDetail(button.dataset.watchTrailer)));
}

function showPoster(id) {
  const film = films.find(item => item.id === id);
  if (!film) return;
  const preview = document.querySelector('#poster-preview');
  preview.src = film.poster || 'posters/fallback-landscape.svg';
  preview.alt = `${film.title} poster`;
  document.querySelector('#poster-dialog').showModal();
}

function showDetail(id) {
  const film = films.find(item => item.id === id);
  if (!film) return;
  const video = toEmbed(film.trailer);
  const localPlayer = isLocalVideo(film.trailer) ? `<video class="trailer-frame" src="${escapeHtml(film.trailer)}" controls autoplay playsinline></video>` : '';
  document.querySelector('#detail-content').innerHTML = `${film.poster ? `<img class="detail-poster" src="${escapeHtml(film.poster)}" alt="${escapeHtml(film.title)} poster">` : ''}
    <p class="eyebrow">${escapeHtml(film.language || 'Other')} · ${escapeHtml(film.genre || 'FROM MY COLLECTION')} ${film.year ? ` · ${escapeHtml(film.year)}` : ''}</p>
    <h2>${escapeHtml(film.title)}</h2><p class="detail-copy">${escapeHtml(film.description || 'A film in my collection.')}</p>
    ${localPlayer || (video ? `<iframe class="trailer-frame" src="${escapeHtml(video)}" title="${escapeHtml(film.title)} trailer" allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><a class="trailer-link" target="_blank" rel="noopener" href="${escapeHtml(film.trailer)}">If it doesn’t start, open the trailer ↗</a>` : film.trailer ? `<p><a class="trailer-link" target="_blank" rel="noopener" href="${escapeHtml(film.trailer)}">Open trailer ↗</a></p>` : '')}`;
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
const posterDialog = document.querySelector('#poster-dialog');
document.querySelector('#close-poster').addEventListener('click', () => posterDialog.close());
posterDialog.addEventListener('click', event => { if (event.target === posterDialog) posterDialog.close(); });
posterDialog.addEventListener('close', () => { document.querySelector('#poster-preview').removeAttribute('src'); });
search.addEventListener('input', render);
document.querySelector('#sort-button').addEventListener('click', () => {
  newestFirst = !newestFirst;
  document.querySelector('#sort-button').innerHTML = `${newestFirst ? 'Recently added' : 'Oldest added'} <span>↕</span>`;
  render();
});
render();
