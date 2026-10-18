# AGENT.md — Design & engineering rules for **Film**

This file is the single source of truth for any agent (or human) touching this site.
Read it fully before changing `index.html`, `style.css`, `script.js`, or any asset.
When a rule here conflicts with your instinct, follow the rule. When a rule is missing, extend this file.
If this file and the code ever disagree (a token value, a duration, a field name), fix whichever is wrong **in the same commit**. Never leave drift.

---

## At a glance — the ten rules that matter most

1. **Warm · cinematic · sweet.** Colder, busier, louder, or more "SaaS" is wrong.
2. **Plain HTML/CSS/JS.** No build, no npm, no framework, no browser storage, no external JS.
3. **One accent** (coral-amber) and warm neutrals only. Tokens before values.
4. **Serif titles, mono uppercase labels, Manrope body.** Nothing in between.
5. **Everything rounded, 1px borders, deep soft shadows.**
6. **Keep the atmosphere:** grain, glow, vignette, Ken Burns, sprockets.
7. **Slow, soft motion.** Only `transform`/`opacity`. Everything obeys reduced motion.
8. **Accessible by default.** Real buttons, visible focus, AA contrast, full keyboard use.
9. **Fast by default.** Lazy images, no trailer downloads before a click, budgets in §14.
10. **Verify before "done".** Serve it, check 3 widths, both dialogs, empty console, run the checks in §16.

---

## 1. What this is

A **personal film archive**: a quiet, warm, cinematic shelf of films someone loves.
It is not a streaming product, not a database, not a dashboard. The feeling to protect:

> *A late-night screening room. Warm lamplight, deep shadows, a projector hum. Sweet, unhurried, a little nostalgic.*

Three words to design against: **warm · cinematic · sweet**.
If a change makes the site feel colder, busier, louder, or more "corporate SaaS", it is wrong.

---

## 2. Stack & files (do not add build steps)

```
index.html          — static markup; one page; no framework
style.css           — all styling; tokens live in :root
script.js           — vanilla JS; `films` array at the top is the only data source
favicon.svg         — the brand mark (फ़ on an accent-gradient rounded square), glyph as outlines
apple-touch-icon.png— 180×180 render of the brand mark (see §15)
og.jpg              — 1200×630 share image, warm and dark (see §15)
posters/            — 16:9 landscape artwork, one per film, named <id>.jpg (+ fallback-landscape.svg)
trailer/            — local .webm trailers, one per film, named <id>.webm
.claude/launch.json — `python3 -m http.server 8765` dev server for previewing
```

Rules:
- **No bundlers, no npm, no frameworks, no CSS preprocessors.** Plain HTML/CSS/JS only.
- **No browser storage** (`localStorage`, `sessionStorage`, cookies, IndexedDB). State lives in memory only.
  The URL hash (`#film-id`, see §15) is allowed: it is shareable state, not storage and not a route.
- **No external JS.** Third-party origins are limited to Google Fonts (the three families below) and, only when a
  film's trailer is a YouTube/Vimeo URL, an iframe created **on click** (see §9). Nothing else loads on page view.
- Everything must work when opened via a plain static server. Nothing may require a backend.
- Keep it one page. New "sections" are allowed; new routes/pages are not.
- Small dev helpers (a shell one-liner, a Python check) are fine as documentation. They must never be required to run the site.

---

## 3. Colour — the palette is law

All colours come from CSS custom properties in `:root` (`style.css`). **Never hard-code a new hex in a component**; add a token first if one is genuinely missing.

| Token | Value | Use |
|---|---|---|
| `--page` | `#14100f` | page background (warm espresso, never pure black) |
| `--page-deep` | `#0d0a09` | deepest surface: dialogs, dark text on accent |
| `--surface` | `#1d1816` | cards, inputs |
| `--surface-raised` | `#26201d` | card gradient top, hover fills |
| `--surface-hover` | `#2d2622` | poster placeholder, hover states |
| `--text` | `#f6efe4` | primary text (warm cream, never `#fff`) |
| `--text-soft` | `#d9cfc1` | hero / dialog body copy |
| `--muted` | `#a59585` | secondary text, descriptions |
| `--faint` | `#907f72` | tertiary: indices, kbd hints, placeholders. *(Was `#6e6158`, which measured 3.2:1 on `--page` and 2.9:1 on `--surface` and failed AA. Update `:root` to match.)* |
| `--line` | `#332a26` | default borders |
| `--line-strong` | `#4a3d37` | hover borders, dialog borders |
| `--accent` | `#f0956b` | **the one accent**: coral-amber. Eyebrows, active states, arrows |
| `--accent-deep` | `#d9714a` | gradient partner for the accent |
| `--accent-soft` | `rgba(240,149,107,.14)` | tinted fills (active tab, focus ring halo) |
| `--accent-glow` | `rgba(240,149,107,.42)` | shadows/glow under accent elements |
| `--gold` | `#e6b86a` | hero meta line only. Second accent, used sparingly |

Rules:
- **One accent.** Coral-amber does all the pointing. Gold is a whisper, used only for the hero meta line. Do not introduce blue, green, purple, or a "success/danger" palette.
- **Warm neutrals only.** Every grey has a brown/red undertone. Pure `#000`, `#fff`, or cool greys are forbidden.
- Accent on a dark surface, or `--page-deep` text on an accent gradient. Never accent text on an accent background.
- Gradients are only ever `--accent → --accent-deep` (135°/145°) or subtle surface-to-surface. No rainbow, no neon.
- Dark theme only. Do not add a light mode unless asked; if asked, derive it by *warming* the palette, not inverting it.
- Text that sits on artwork (hero, poster chips) must sit on the vignette or on a glass pill, never directly on the image.
- Declare `color-scheme: dark` on `:root` so scrollbars, form controls and the native `<dialog>` backdrop match.

### Measured contrast (WCAG 2.x, computed — re-run if a token changes)

| Pair | Ratio | Verdict |
|---|---|---|
| `--text` on `--page` / `--surface` | 16.5 / 15.4 | AA, AAA |
| `--text-soft` on `--page` / `--surface` | 12.3 / 11.4 | AA, AAA |
| `--muted` on `--page` / `--surface` / `--surface-raised` / `--surface-hover` | 6.5 / 6.1 / 5.5 / 5.1 | AA |
| `--faint` (new) on `--page-deep` / `--page` / `--surface` | 5.1 / 4.9 / 4.6 | AA |
| `--faint` (new) on `--surface-raised` / `--surface-hover` | 4.2 / 3.9 | **fails AA — never use there** |
| `--accent` on `--page` / `--surface` | 8.3 / 7.7 | AA, AAA |
| `--accent` on the active-tab fill (accent-soft over page) | ≈6.6 | AA |
| `--gold` on `--page` | 10.3 | AA, AAA |
| `--page-deep` on `--accent` / `--accent-deep` | 8.7 / 6.0 | AA |

Rule: **`--faint` goes only on `--page`, `--page-deep` or `--surface`.** On raised/hover fills use `--muted`.

---

## 4. Typography — three voices

Loaded from Google Fonts in `index.html`:

| Role | Family | Token | Where |
|---|---|---|---|
| **Display** | Cormorant Garamond (500/600/700, + italics) | `--display` | Film titles, section headings, hero title, empty-state, footer note |
| **Body** | Manrope (400–700) | `--body` | Paragraphs, buttons, brand wordmark |
| **Label** | DM Mono (400/500) | `--mono` | Eyebrows, meta lines, tabs, counts, kbd, footer |

Rules:
- **Titles are serif, tight, big.** Display headings use `letter-spacing` between `-.4px` and `-1.6px`, line-height `.98`–`1.1`, `text-wrap: balance`.
- **Labels are mono, tiny, tracked, uppercase.** 10–12px, `letter-spacing: 1px–1.6px`, `text-transform: uppercase`. This is the "projection booth" voice.
- **Body is Manrope 14–16px** with generous line-height (`1.6`–`1.8`). Descriptions are clamped to 3 lines on cards (4 on mobile hero).
- Italic Cormorant is reserved for *sentiment* (empty state, footer note). Don't use it for emphasis in body copy.
- Scale with `clamp()`; never jump sizes with hard breakpoints alone.
- Numbers that count things (film count, tabs, "Nº 02") are **zero-padded to two digits** via `pad()` in `script.js`. Use `Nº` (U+00BA), not `#`.
- Always request fonts with `display=swap`, and request only the weights/italics actually used (italic Cormorant is used in two places, so load one italic weight).
- Long titles must never cause horizontal scroll at 320px: `overflow-wrap: anywhere` on `.film-title` and hero title.
- A title written in a non-Latin script gets a `lang` attribute on its element (`lang="ml"`, `lang="hi"`, …) so screen readers and font fallback behave.

---

## 5. Spacing, shape, depth

- Horizontal page gutter is always `var(--gutter)` = `clamp(16px, 4.5vw, 72px)`. Nothing touches the viewport edge. On notched phones in landscape, use `max(var(--gutter), env(safe-area-inset-left))` (and right).
- Radii: `--radius` 18px (cards, dialogs), `--radius-sm` 10px, `--radius-pill` for every button, chip, tab, input. Hero is `--radius + 8px`. **Nothing is square-cornered** except the trailer video itself.
- Borders are 1px `--line`, promoted to `--line-strong` on hover. No 2px borders.
- Shadows are deep, soft, and negative-spread (`0 20px 50px -24px rgba(0,0,0,.8)`), optionally with a faint `--accent-glow` on hover. Shadows never look like Material elevation.
- Cards have a 1px inner highlight on top (`inset 0 1px 0 rgba(255,255,255,.03)`) — the "lacquer" edge. Keep it.
- Vertical rhythm: section padding `clamp(56px, 8vw, 104px)`; grid gap `34px 28px`; inside cards `20px 22px 22px`.
- Anchored sections get `scroll-margin-top` equal to the sticky bar height so headings aren't hidden under it.
- Full-height things use `svh`/`dvh` with a `vh` fallback line above (`height: 72vh; height: 72svh;`) so mobile browser chrome doesn't clip them.

---

## 6. Atmosphere layers (the things that make it feel cinematic)

These are deliberate and must survive refactors:

1. **Film grain** — `body::after`, fixed, SVG `feTurbulence`, `opacity: .055`, `mix-blend-mode: overlay`, `pointer-events: none`. Keep opacity between `.04` and `.07`. Never remove. **It is the only fixed full-viewport blend layer allowed** — don't add a second.
2. **Ambient glow blobs** — `.ambient .glow-a/.glow-b`, huge warm radial gradients drifting on a 26s loop. They are *behind* everything (`z-index: 0`); content sits at `z-index: 2`. Prefer soft gradient falloff over `filter: blur()` on huge elements; if blur is used, animate only `transform`.
3. **Hero vignette** — two stacked linear gradients darkening the left and bottom so text sits in shadow while the artwork stays bright on the right.
4. **Ken Burns on the hero backdrop** — 28s slow zoom/pan, alternating. Scale 1.04 → 1.12 only; never faster, never bigger.
5. **Sprocket strip** — the row of translucent film-perforation rectangles along the hero's bottom edge (`.sprockets`). It's the one literal "film" reference. Don't add more clichés (no clapperboards, no reels, no popcorn).
6. **Poster wash in the detail dialog** — `.detail-dialog::before` blurs the film's own poster (`--backdrop`, set from JS) at `.22` opacity so every trailer dialog is tinted by its film.
7. **Sticky glass top bar** — transparent at top; after 8px of scroll gets `.is-scrolled` → `backdrop-filter: blur(16px) saturate(140%)` and a `--line` border. Provide a fallback: `@supports not (backdrop-filter: blur(1px))` → solid `--page` at ~.94 opacity.

---

## 7. Motion rules

- Easing tokens: `--ease-out` (`cubic-bezier(.22,1,.36,1)`) for movement/entrances; `--ease-spring` (`cubic-bezier(.34,1.56,.64,1)`) only for small playful pops (buttons, play badge, brand mark, arrows).
- **Duration tokens (the complete list):**

  | Token | Value | Use |
  |---|---|---|
  | `--fast` | 180ms | colour / opacity |
  | `--med` | 360ms | dialog entrance |
  | `--slow` | 520ms | transforms / entrances |
  | `--zoom` | 900ms | poster hover zoom **only** |
  | ambient loops | 26s / 28s | glow blobs / Ken Burns |

  Any other duration needs a new token here first. (`--med` and `--zoom` formalise values the site already uses; add them to `:root` if they're still bare numbers.)
- Animate only `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`, `filter` or `box-shadow` size.
- Entrances: `rise` keyframe (18px up + fade). Cards stagger with `animation-delay: calc(min(var(--i), 8) * 70ms)` — `--i` is set inline from JS. **The cap of 8 is mandatory**: without it, card 40 waits ~2.8s.
- The stagger plays on first load and when the language tab changes. **It does not replay on every search keystroke or sort toggle** — re-render those instantly (no `rise`).
- Hover on a card = lift 6px + poster zooms to 1.06 over `--zoom` + play badge springs in + expand button fades in. All four together; don't half-implement.
- Dialogs enter with `dialog-in` (14px up, scale .985 → 1, `--med`).
- `@media (prefers-reduced-motion: reduce)` kills **all** animations and transitions (including smooth scrolling). Any new animation must be covered by that block (it already uses `*`; keep it that way). Smooth scroll is only ever set inside `@media (prefers-reduced-motion: no-preference)`.
- Touch devices (`@media (hover: none)`) always show the play badge and expand button — hover-only affordances are never the only path.

---

## 8. Components & their contracts

### Page structure
`<header>` (top bar) → `<main id="top">` (collection) → `<footer>`. First focusable element is a **skip link** ("Skip to films") that is visually hidden until focused, then appears as an accent pill top-left. Collection is a `<section>` with an `<h1>` heading (`aria-labelledby="collection-title"`).

### Brand
`फ़` glyph (Devanagari "fa", `lang="hi"`) in a 38px accent-gradient rounded square + "Film" in Manrope 700. Tilts −6° on hover. Footer version is 30px. The favicon mirrors it. **`favicon.svg` must contain the glyph as outlined paths, not `<text>`** — favicons can't load web fonts, so `<text>` renders in whatever the OS has.

### Top bar
Sticky. Nav links are pill-shaped mono uppercase; `.active` is accent-coloured. `.is-scrolled` is toggled by an `IntersectionObserver` on an 8px sentinel at the top of the page (preferred) or a `passive` scroll listener throttled with `requestAnimationFrame`. Never a bare scroll handler.

### Collection header
Eyebrow "The archive", display "All films (xx)", search pill with `⌕` and a `/` kbd hint (pressing `/` focuses search), and a sort pill toggling "Recently added" ↔ "Oldest added".
- Search is `<input type="search">` with a real `<label>` (visually hidden is fine), `autocomplete="off"`, `spellcheck="false"`, `enterkeyhint="search"`.
- Matching is case- and diacritic-insensitive (`normalize('NFD')`, strip combining marks) across title, genre, language and year.
- `Esc` inside the search clears it. The result count is announced through a polite live region (`aria-live="polite"`, e.g. "12 films").

### Language tabs
Pill tabs, `role="tab"`, `aria-selected`. Active = `--accent-soft` fill with accent text. Horizontally scrollable, scrollbar hidden. Counts are zero-padded. Order: "All" first, then languages alphabetically.
- Implement the full tab keyboard pattern: roving `tabindex` (active tab `0`, others `-1`), `←`/`→` move and activate, `Home`/`End` jump, and each tab has `aria-controls` pointing at the film grid (`role="tabpanel"`, `aria-labelledby` the active tab).
- When the active tab scrolls out of view in the strip, call `scrollIntoView({ inline: 'center', block: 'nearest' })` on it.

### Film card
```
article.film-card (style="--i:n", aria-labelledby="title-<id>")
├─ .poster (16:9)
│  ├─ button.poster-play  → img + .play-badge        (opens trailer)
│  ├─ span.poster-chip     (language, glass pill, top-left)
│  └─ button.poster-expand (⤢, glass circle, top-right, opens full poster)
└─ .film-body
   ├─ .film-meta  (genre · left, "Nº xx" faint · right)
   ├─ h3.film-title#title-<id> (display)
   ├─ p.film-note   (3-line clamp)
   └─ button.watch-trailer-button ("Watch trailer →", arrow slides on hover)
```
Grid: `repeat(auto-fill, minmax(min(100%, 340px), 1fr))`. Cards are equal height (`flex` column, button pushed to bottom with `margin-top: auto`).
- Poster `<img>`: `loading="lazy"`, `decoding="async"`, `width="1280" height="720"`, and `alt="<Title> — key art"`.
- Repeated buttons need unique names. Visible text stays "Watch trailer", and the accessible name extends it: `aria-label="Watch trailer — <Title>"`. Likewise `poster-play` → `"Play trailer — <Title>"`, `poster-expand` → `"View poster — <Title>"`.

### Dialogs
Native `<dialog>` + `showModal()`. Closed by ×, backdrop click, or Esc. Close button is a glass circle that turns accent and rotates 90° on hover.
- **Poster dialog**: just the image, rounded, on `--page-deep`.
- **Detail dialog**: video on top (16:9, `poster=` the film's artwork), then a two-column `.detail-info` (meta + title + fallback link | description). Collapses to one column ≤900px.
- Every dialog has `aria-labelledby` pointing at its title (or `aria-label` for the poster dialog: "<Title> poster").
- Backdrop click closes only when `event.target === dialog` (clicks inside the content must not close it).
- **On close, always stop the trailer:** `video.pause()`, then remove its `src`/`load()` (or remove the iframe). A trailer must never keep playing audio behind a closed dialog.
- **Nothing downloads before a click.** The `<video>` has `preload="none"`, `playsinline`, `controls`, and its `src` is set only when the dialog opens.
- Lock background scroll while open: `body:has(dialog[open]) { overflow: hidden; }`.
- Dialog height uses `max-height: 92dvh` (with `vh` fallback). Focus returns to the control that opened it; verify this in Safari and add a manual `opener.focus()` if it doesn't.
- Never autoplay anything on page load. A trailer may start playing when the person clicks to open it (that click is the gesture).

### Empty state
Italic Cormorant, centred, gently worded ("Nothing on the reel for that — try another search."). Never a red error. It has `role="status"` so it is announced.

### No-JS fallback
The grid is rendered by JS, so `index.html` includes a `<noscript>` inside the collection section, written in the empty-state voice ("This shelf needs JavaScript to light the projector.").

---

## 9. Content & data rules

Add a film by appending to the `films` array in `script.js`:

```js
{
  id: 'kebab-case-unique',                    // lowercase ASCII; used for data attributes, anchors, filenames
  title: 'Exact Title',                       // use real typographic quotes ’ “ ” if the title has them
  description: '1–3 sentences.',              // what it's about + why it's here; no spoilers; ≤ ~280 chars
  year: '',                                   // 4-digit string; empty is fine (omitted from meta if blank)
  language: 'Malayalam',                      // becomes a tab; capitalised; blank → "Other"; spell it identically every time
  genre: 'Dark comedy',                       // free text; separate multiples with ' · ' (middle dot)
  poster: 'posters/kebab-case-unique.jpg',    // 16:9, 1280×720 target (≥1024×576), ≤ ~200 KB
  trailer: 'trailer/kebab-case-unique.webm',  // local .webm preferred; YouTube/Vimeo URLs also work
  addedAt: 3                                  // increment; unique; drives sort order and which film is the hero
}
```

**Planned optional fields** (do **not** add until the renderer supports them — see §17): `director` (string), `runtime` (minutes, number), `captions` (path to a `.vtt` file for the trailer).

- **File names match the `id`:** `posters/<id>.jpg`, `trailer/<id>.webm`. ASCII, lowercase, no spaces, no curly quotes, so URL-encoding never goes wrong. (Older files that keep the film's real title still work — rename them when you next touch that film, then re-run the checks in §16.) `fallback-landscape.svg` stays as is.
- Posters are **landscape 16:9** (key art / banner), not portrait one-sheets. If none exists, omit `poster` and the fallback SVG is used. JPG at quality ≈80 or WebP; no PNG for photographic art.
- The hero shows the newest film's poster full-bleed, so any poster can become the hero someday: keep them sharp, 1280×720 or larger.
- **Trailers:** target ≤ 30 MB, hard cap ~80 MB; 720p; `.webm` (VP9 + Opus). A starting-point encode (tune `-crf` up for smaller, down for sharper):
  ```bash
  ffmpeg -i input.mp4 -vf scale=-2:720 -c:v libvpx-vp9 -crf 33 -b:v 0 -row-mt 1 -c:a libopus -b:a 96k trailer/<id>.webm
  ```
- **Hosted trailers (YouTube/Vimeo):** use the privacy-enhanced host (`https://www.youtube-nocookie.com/embed/<videoId>`). Build the `<iframe>` only when the dialog opens, with `title="<Title> — trailer"`, `loading="lazy"`, `allow="autoplay; encrypted-media; picture-in-picture"`, `allowfullscreen`, `referrerpolicy="strict-origin-when-cross-origin"`, and remove it when the dialog closes.
- **Escaping & safety:** all strings pass through `escapeHtml()` before rendering — including values placed in attributes (`alt`, `aria-label`, `title`, `src`). Never inject raw HTML from film data. URLs from data must be relative paths or `https:`; never `javascript:` or `data:`.

---

## 10. Accessibility (non-negotiable)

- Every clickable thing is a real `<button>` or `<a>`, with a text label or `aria-label`. Repeated controls have unique accessible names (see §8, Film card).
- Decorative glyphs/arrows get `aria-hidden="true"`; the hero backdrop image has empty `alt`; poster images in cards have real `alt`.
- Focus is visible everywhere: global `:focus-visible` = 2px accent outline, 4px offset.
- Tabs use `role="tab"` + `aria-selected` **and** the keyboard pattern in §8; the tab strip is `role="tablist"`.
- Dialogs are native `<dialog>` so focus trapping and Esc come for free — don't replace them with divs. They are labelled (§8).
- Contrast: every text/background pair meets AA (4.5:1 normal, 3:1 for ≥24px or ≥18.7px bold). The measured table is in §3; `--faint` is restricted to `--page`/`--page-deep`/`--surface`.
- Touch targets are ≥ 44×44 CSS px. A pill may *look* 34px tall if padding or a `::before { inset: -6px }` expands the hit area. Check the glass close button, expand button and tabs.
- Keyboard shortcut `/` focuses search but is ignored while typing or when a dialog is open.
- Landmarks and a skip link exist (§8). Zoom is never disabled: no `maximum-scale` or `user-scalable=no` in the viewport meta.
- Search results and empty states are announced (live region / `role="status"`).
- `prefers-reduced-motion` is honoured (§7). Nothing autoplays on load.
- Tab through the whole page once after any markup change. Every control must be reachable, in visual order, with a visible ring.

---

## 11. Responsive breakpoints

- `≤900px` — detail dialog goes single column.
- `≤760px` — hero becomes bottom-vignette only, taller (72svh); heading stacks; search stretches; kbd hint hides; expand button always visible; footer wraps.
- `≤480px` — first nav link hides; type sizes step down; footer note goes full-width.
- Minimum supported width: **320px**. No horizontal scroll, ever (`body { overflow-x: hidden }` is a safety net, not a license).
- Also check a short landscape phone (~700×360): the dialogs must still fit and scroll internally.

---

## 12. Workflow for agents

1. **Serve, don't open.** Relative assets don't load from `file://` snapshots. Run:
   ```bash
   python3 -m http.server 8765 --bind 127.0.0.1
   ```
   (or `preview_start` with the `film` config in `.claude/launch.json`).
2. **Check three widths** after any visual change: ~380px (phone), ~768px (tablet), ≥1280px (desktop). Also 320px once.
3. **Check both dialogs** (poster + trailer) and the hover state of a card. Close the trailer mid-playback and confirm the audio stops.
4. **Console must be empty.** No 404s for fonts, posters, or trailers. In the Network tab, confirm **no `.webm` is requested on page load**.
5. **Keyboard pass.** Tab through the page; use `←/→` on the tabs; open and close a dialog with the keyboard only.
6. **Reduced motion.** Toggle "prefers-reduced-motion: reduce" in DevTools; nothing should move.
7. **Run the content checks in §16** after any change to `films` or to `posters/` / `trailer/`.
8. **Don't reformat files wholesale.** `style.css` is grouped by section with `/* ---------- name ---------- */` headers; add to the right section. `script.js` keeps data at top, helpers, `renderHero()`, `render()`, dialogs, listeners, then the two render calls at the bottom.
9. **Tokens before values.** If you type a hex, a duration or a bare easing curve in a component rule, stop and add a token.
10. **Every new animation/transition** must be neutralised by the `prefers-reduced-motion` block.
11. If you change a rule or a token, change this file in the same commit.
12. Commit messages: short imperative ("Add poster chip to cards"), no emoji.

---

## 13. Done checklist

**Taste** — before you call something done, ask:

- Does it look like warm lamplight on dark wood — or like a dark-mode admin panel?
- Is there exactly **one** accent colour doing the pointing?
- Are titles serif and labels mono-uppercase, with nothing in between?
- Are all corners rounded, all buttons pills, all borders 1px?
- Is motion slow and soft, with only tiny spring pops?
- Would removing the grain, the glow, or the sprockets make it feel flatter? (Then don't.)
- Is it still sweet?

**Craft** — and then:

- Console empty; no trailer fetched before a click; trailer silent after close.
- Keyboard-only run works; focus ring visible everywhere.
- No new colour, duration or radius that isn't a token.
- §16 checks print nothing.
- Lighthouse (mobile) meets the targets in §14.

---

## 14. Performance budget

These are targets to verify with Lighthouse (mobile preset) and DevTools "Slow 4G". They are goals, not guarantees.

| Metric | Target |
|---|---|
| Lighthouse mobile — Performance / Accessibility / Best Practices / SEO | ≥ 90 / 100 / ≥ 95 / ≥ 95 |
| LCP (hero image) | ≤ 2.5 s on Slow 4G |
| CLS | ≤ 0.05 |
| HTML + CSS + JS | ≤ 60 KB gzipped combined |
| Fonts | ≤ 150 KB total, `display=swap`, only used weights |
| Hero image | ≤ 250 KB |
| Card posters | ≤ 200 KB each, `loading="lazy"` |
| Trailer bytes before a click | **0** |

Rules:
- `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` precede the font stylesheet.
- Reserve space for every image (`width`/`height` or `aspect-ratio`) so nothing shifts when it loads.
- Build the grid in one pass (a `DocumentFragment` or a single `innerHTML` assignment), not one DOM write per card.
- Past ~60 films, add `content-visibility: auto; contain-intrinsic-size: auto 420px;` to `.film-card`. Past ~200, add a gentle "Show more" pill (no infinite scroll).
- No `will-change` sprinkled everywhere — only on the two glow blobs and the hero backdrop, which actually animate.

---

## 15. Metadata, sharing & deep links

Required in `<head>`:

```html
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Film — a personal archive of films I love</title>
<meta name="description" content="A quiet, warm shelf of films worth keeping — trailers, posters and a line on why each one is here.">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#14100f">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="Film — a personal archive of films I love">
<meta property="og:description" content="A quiet, warm shelf of films worth keeping.">
<meta property="og:image" content="og.jpg">
<meta name="twitter:card" content="summary_large_image">
```

- Once the site has a real URL, make `og:image` absolute and add `<link rel="canonical">`.
- `theme-color` is the only place a hex may appear outside `:root`, and it must equal `--page`.
- `og.jpg` is 1200×630, espresso background with a warm poster still or the brand mark, no text clutter.
- **Deep links:** `#<film-id>` opens that film's trailer dialog on load. Opening a dialog sets the hash with `history.replaceState`; closing it removes it. Handle `hashchange`; ignore unknown ids. This is state in the URL, not a route and not storage.
- **Structured data (optional):** generate a `<script type="application/ld+json">` `ItemList` of `Movie` entries **from the `films` array at render time**. Never hand-copy film data into `index.html` — `films` stays the only data source.

---

## 16. Content & asset checks (run from the project root)

All three should print nothing when the data is healthy.

```bash
# 1. Every poster/trailer path referenced in script.js exists on disk
grep -oE "(posters|trailer)/[^'\"]+" script.js | sort -u | while read -r f; do
  p=$(python3 -c "import sys,urllib.parse as u;print(u.unquote(sys.argv[1]))" "$f")
  [ -f "$p" ] || echo "MISSING  $p"
done

# 2. Duplicate ids or duplicate addedAt values
grep -oE "id: *'[^']+'" script.js | sort | uniq -d
grep -oE "addedAt: *[0-9]+" script.js | sort | uniq -d

# 3. Language spellings (eyeball this list: a typo creates a stray tab)
grep -oE "language: *'[^']*'" script.js | sort | uniq -c
```

Manual, per film:
- The description has no spoilers and says *why it's here*, not just what it's about.
- The poster is genuinely 16:9 and sharp at the hero size; the trailer is ≤ the size cap and plays in Chrome and Safari.
- The title uses real typographic quotes where needed.

---

## 17. Upgrade backlog (in priority order)

Work top-down. Each item must pass the taste checklist (§13) — better means more useful **and** still warm, cinematic, sweet.

**P0 — fix real problems first**
1. [x] Stop the trailer on dialog close; `preload="none"`; set `src` only on open (§8).
2. [x] Sync `--faint` to `#907f72` in `:root`; keep `--faint` off raised/hover fills (§3).
3. [x] Cap the card stagger at 8 steps; don't replay it on search or sort (§7).
4. [x] Tab keyboard pattern + `aria-controls`; unique accessible names on repeated card buttons; real `alt` on posters (§8, §10).
5. [x] Head metadata, skip link, landmarks, `<noscript>` (§8, §15).
6. [x] Lazy-load posters, `fetchpriority="high"` on the hero image, explicit image dimensions (§8, §14).
7. [x] Rename assets to `<id>.<ext>` and run the checks in §16 (§9).
8. [x] Convert the favicon glyph to outlines; add `apple-touch-icon.png` and `og.jpg` (§8, §15).

**P1 — make it nicer to use**
9. [x] Deep links (`#film-id`) plus a small mono "Copy link" pill in the detail dialog with "Link copied ✓" feedback.
10. [x] Previous / next film inside the trailer dialog (`←` / `→` keys & buttons, with a "Nº 01 / 02" mono counter) to browse the shelf.
11. [ ] Genre filter: a quieter second row of mono chips under the language tabs, single-select, combining with search and language.
12. [x] **"Surprise me"** — a ghost pill that opens a random film from the current filter. Sweet, on-brand, tiny.
13. [x] Search upgrades from §8 (diacritic-insensitive, `Esc` clears, live count).
14. [x] Support `director`, `runtime`, and `year` fields in the meta line, dialog, and in search.

**P2 — only if they still feel like lamplight**
15. [ ] `captions` (`.vtt`) for trailers in languages other than English, with a `<track>` element.
16. [ ] An optional `featured: true` flag if hero section is re-introduced.
17. [x] A restrained print stylesheet (`@media print`) that turns the shelf into a plain, ink-friendly list.

**Anti-features — do not add:** accounts or logins, star ratings, comments, streaming-service links, auto-rotating carousels, autoplaying hero video, infinite scroll, a light-mode toggle, cookie banners (there are no cookies), emoji in the UI, a second accent colour.

---

## 18. Revision log

What changed from the previous version of this file, so the diff is reviewable:

- **Apple Web App & PWA standard:** Added [manifest.webmanifest](file:///home/kanishk/Desktop/Film/manifest.webmanifest), `viewport-fit=cover`, safe-area insets (`env(safe-area-inset-*)`), and tap-highlight suppression per `joe-bell/apple-web-app`.
- **Interaction & browsing upgrades:** Added "Surprise me" random reel picker, deep link copy button with visual state feedback, next/prev film navigation in trailer modal (mouse & `←`/`→` arrow keys), and dynamic Schema.org `Movie` ItemList structured data.
- **Print media query:** Added clean ink-friendly `@media print` rules per P2 backlog item 17.
- **Hero removal:** Cleaned up `#featured` hero and streamlined collection as the primary focus with semantic `<h1>`.
