# AGENT.md — Design & engineering rules for **Film**

This file is the single source of truth for any agent (or human) touching this site.
Read it fully before changing `index.html`, `style.css`, `script.js`, or any asset.
When a rule here conflicts with your instinct, follow the rule. When a rule is missing, extend this file.

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
index.html        — static markup; one page; no framework
style.css         — all styling; tokens live in :root
script.js         — vanilla JS; `films` array at the top is the only data source
favicon.svg       — the brand mark (फ़ on an accent-gradient rounded square)
posters/          — 16:9 landscape artwork, one per film (+ fallback-landscape.svg)
trailer/          — local .webm trailers, one per film
.claude/launch.json — `python3 -m http.server 8765` dev server for previewing
```

Rules:
- **No bundlers, no npm, no frameworks, no CSS preprocessors.** Plain HTML/CSS/JS only.
- **No browser storage** (`localStorage`, cookies, IndexedDB). State lives in memory only.
- **No external JS.** The only external dependency is Google Fonts (the three families below).
- Everything must work when opened via a plain static server. Nothing may require a backend.
- Keep it one page. New "sections" are allowed; new routes/pages are not.

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
| `--faint` | `#6e6158` | tertiary: indices, kbd hints, placeholders |
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

---

## 5. Spacing, shape, depth

- Horizontal page gutter is always `var(--gutter)` = `clamp(16px, 4.5vw, 72px)`. Nothing touches the viewport edge.
- Radii: `--radius` 18px (cards, dialogs), `--radius-sm` 10px, `--radius-pill` for every button, chip, tab, input. Hero is `--radius + 8px`. **Nothing is square-cornered** except the trailer video itself.
- Borders are 1px `--line`, promoted to `--line-strong` on hover. No 2px borders.
- Shadows are deep, soft, and negative-spread (`0 20px 50px -24px rgba(0,0,0,.8)`), optionally with a faint `--accent-glow` on hover. Shadows never look like Material elevation.
- Cards have a 1px inner highlight on top (`inset 0 1px 0 rgba(255,255,255,.03)`) — the "lacquer" edge. Keep it.
- Vertical rhythm: section padding `clamp(56px, 8vw, 104px)`; grid gap `34px 28px`; inside cards `20px 22px 22px`.

---

## 6. Atmosphere layers (the things that make it feel cinematic)

These are deliberate and must survive refactors:

1. **Film grain** — `body::after`, fixed, SVG `feTurbulence`, `opacity: .055`, `mix-blend-mode: overlay`. Keep opacity between `.04` and `.07`. Never remove.
2. **Ambient glow blobs** — `.ambient .glow-a/.glow-b`, huge blurred warm radial gradients drifting on a 26s loop. They are *behind* everything (`z-index: 0`); content sits at `z-index: 2`.
3. **Hero vignette** — two stacked linear gradients darkening the left and bottom so text sits in shadow while the artwork stays bright on the right.
4. **Ken Burns on the hero backdrop** — 28s slow zoom/pan, alternating. Scale 1.04 → 1.12 only; never faster, never bigger.
5. **Sprocket strip** — the row of translucent film-perforation rectangles along the hero's bottom edge (`.sprockets`). It's the one literal "film" reference. Don't add more clichés (no clapperboards, no reels, no popcorn).
6. **Poster wash in the detail dialog** — `.detail-dialog::before` blurs the film's own poster (`--backdrop`, set from JS) at `.22` opacity so every trailer dialog is tinted by its film.
7. **Sticky glass top bar** — transparent at top; after 8px of scroll gets `.is-scrolled` → `backdrop-filter: blur(16px) saturate(140%)` and a `--line` border.

---

## 7. Motion rules

- Easing tokens: `--ease-out` (`cubic-bezier(.22,1,.36,1)`) for movement/entrances; `--ease-spring` (`cubic-bezier(.34,1.56,.64,1)`) only for small playful pops (buttons, play badge, brand mark, arrows).
- Durations: `--fast` 180ms for colour/opacity, `--slow` 520ms for transforms/entrances. Nothing between 600ms–2s except the long ambient loops.
- Entrances: `rise` keyframe (18px up + fade). Cards stagger with `animation-delay: calc(var(--i) * 70ms)` — `--i` is set inline from JS.
- Hover on a card = lift 6px + poster zooms to 1.06 over 900ms + play badge springs in + expand button fades in. All four together; don't half-implement.
- Dialogs enter with `dialog-in` (14px up, scale .985 → 1, 360ms).
- `@media (prefers-reduced-motion: reduce)` kills **all** animations and transitions. Any new animation must be covered by that block (it already uses `*`; keep it that way).
- Touch devices (`@media (hover: none)`) always show the play badge and expand button — hover-only affordances are never the only path.

---

## 8. Components & their contracts

### Brand
`फ़` glyph (Devanagari "fa", `lang="hi"`) in a 38px accent-gradient rounded square + "Film" in Manrope 700. Tilts −6° on hover. Footer version is 30px. The favicon mirrors it.

### Top bar
Sticky. Nav links are pill-shaped mono uppercase; `.active` is accent-coloured. On ≤480px the first link hides.

### Hero (`#featured`)
Always shows the **most recently added** film (highest `addedAt`). Rendered by `renderHero()`. Contains: pulsing dot + "Now showing · Nº xx" eyebrow, display title, gold mono meta line, 3-line clamped copy, primary "Play trailer" pill (gradient) + ghost "View poster" pill, sprocket strip. If there are no films, `hero.hidden = true`.

### Collection header
Eyebrow "The archive", display "All films (xx)", search pill with `⌕` and a `/` kbd hint (pressing `/` focuses search), and a sort pill toggling "Recently added" ↔ "Oldest added".

### Language tabs
Pill tabs, `role="tab"`, `aria-selected`. Active = `--accent-soft` fill with accent text. Horizontally scrollable, scrollbar hidden. Counts are zero-padded.

### Film card
```
article.film-card (style="--i:n")
├─ .poster (16:9)
│  ├─ button.poster-play  → img + .play-badge        (opens trailer)
│  ├─ span.poster-chip     (language, glass pill, top-left)
│  └─ button.poster-expand (⤢, glass circle, top-right, opens full poster)
└─ .film-body
   ├─ .film-meta  (genre · left, "Nº xx" faint · right)
   ├─ h3.film-title (display)
   ├─ p.film-note   (3-line clamp)
   └─ button.watch-trailer-button ("Watch trailer →", arrow slides on hover)
```
Grid: `repeat(auto-fill, minmax(min(100%, 340px), 1fr))`. Cards are equal height (`flex` column, button pushed to bottom with `margin-top: auto`).

### Dialogs
Native `<dialog>` + `showModal()`. Closed by ×, backdrop click, or Esc. Close button is a glass circle that turns accent and rotates 90° on hover.
- **Poster dialog**: just the image, rounded, on `--page-deep`.
- **Detail dialog**: video on top (16:9, `poster=` the film's artwork), then a two-column `.detail-info` (meta + title + fallback link | description). Collapses to one column ≤900px.

### Empty state
Italic Cormorant, centred, gently worded ("Nothing on the reel for that — try another search."). Never a red error.

---

## 9. Content & data rules

Add a film by appending to the `films` array in `script.js`:

```js
{
  id: 'kebab-case-unique',          // used for data attributes; must be unique
  title: 'Exact Title',             // use real typographic quotes ’ “ ” if the title has them
  description: '1–3 sentences.',    // what it's about + why it's here; no spoilers
  year: '',                         // string; empty is fine (it's omitted from meta if blank)
  language: 'Malayalam',            // becomes a tab; capitalise; blank → "Other"
  genre: 'Dark comedy',             // free text; separate multiples with ' · ' (middle dot)
  poster: 'posters/Title.jpg',      // 16:9 landscape, ≥1024×576; URL-encode spaces as %20
  trailer: 'trailer/title.webm',    // local .webm/.mp4 preferred; YouTube/Vimeo URLs also work
  addedAt: 3                        // increment; drives sort order and which film is the hero
}
```

- Posters are **landscape 16:9** (key art / banner), not portrait one-sheets. If none exists, omit `poster` and the fallback SVG is used.
- Keep local trailers under ~80 MB; prefer `.webm`.
- File names in `posters/` and `trailer/` may keep the film's real title; the fallback SVG stays as is.
- All strings pass through `escapeHtml()` before rendering. Never inject raw HTML from film data.

---

## 10. Accessibility (non-negotiable)

- Every clickable thing is a real `<button>` or `<a>`, with a text label or `aria-label`.
- Decorative glyphs/arrows get `aria-hidden="true"`; the hero backdrop image has empty `alt`.
- Focus is visible everywhere: global `:focus-visible` = 2px accent outline, 4px offset.
- Tabs use `role="tab"` + `aria-selected`; the tab strip is `role="tablist"`.
- Dialogs are native `<dialog>` so focus trapping and Esc come for free — don't replace them with divs.
- Contrast: `--text`/`--muted` on `--page`/`--surface` pass AA; keep it so. Don't put `--faint` on anything smaller than 10px mono.
- Keyboard shortcut `/` focuses search but is ignored while typing or when a dialog is open.

---

## 11. Responsive breakpoints

- `≤900px` — detail dialog goes single column.
- `≤760px` — hero becomes bottom-vignette only, taller (72vh); heading stacks; search stretches; kbd hint hides; expand button always visible; footer wraps.
- `≤480px` — first nav link hides; type sizes step down; footer note goes full-width.
- Minimum supported width: **320px**. No horizontal scroll, ever (`body { overflow-x: hidden }` is a safety net, not a license).

---

## 12. Workflow for agents

1. **Serve, don't open.** Relative assets don't load from `file://` snapshots. Run:
   ```bash
   python3 -m http.server 8765 --bind 127.0.0.1
   ```
   (or `preview_start` with the `film` config in `.claude/launch.json`).
2. **Check three widths** after any visual change: ~380px (phone), ~768px (tablet), ≥1280px (desktop).
3. **Check both dialogs** (poster + trailer) and the hover state of a card.
4. **Console must be empty.** No 404s for fonts, posters, or trailers.
5. **Don't reformat files wholesale.** `style.css` is grouped by section with `/* ---------- name ---------- */` headers; add to the right section. `script.js` keeps data at top, helpers, `renderHero()`, `render()`, dialogs, listeners, then the two render calls at the bottom.
6. **Tokens before values.** If you type a hex or a bare easing curve in a component rule, stop and add a token.
7. **Reduced motion.** Every new animation/transition must be neutralised by the `prefers-reduced-motion` block.
8. Commit messages: short imperative ("Add poster chip to cards"), no emoji.

---

## 13. Quick taste checklist

Before you call something done, ask:

- Does it look like warm lamplight on dark wood — or like a dark-mode admin panel?
- Is there exactly **one** accent colour doing the pointing?
- Are titles serif and labels mono-uppercase, with nothing in between?
- Are all corners rounded, all buttons pills, all borders 1px?
- Is motion slow and soft, with only tiny spring pops?
- Would removing the grain, the glow, or the sprockets make it feel flatter? (Then don't.)
- Is it still sweet?
