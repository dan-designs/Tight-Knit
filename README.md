# Tight Knit · Event site

A small static site for Tight Knit — an independent event promotion group in
Richmond, VA. The home page is always the **current on-sale event**; past events
are archived, each preserved as it appeared when it was live. Pure static
HTML/CSS/JS — no build step, no dependencies.

## Pages

- **`index.html`** — the current event landing page (**Field Day // 001**, Oct 10
  2026). Hero over an animated **day→night field scene** (`data-anim="fieldday"`),
  the single-stage bill, an "In The Field" activity grid, details, a teaser, and a
  shared header/footer. Buy-tickets CTAs → the current Shotgun event.
  Styles: `home.css` · Script: `home.js`.
- **`past-events.html`** — the **"Follow the Thread"** archive: a woven SVG thread
  (generated in JS through each event node) that winds between event cards. Each
  node links into that event's preserved page and carries its own accent color.
- **`events/*.html`** — archived event snapshots (`sidequest-001`, `park-raiser`,
  `tangle-001`, `tkf-001`). Each keeps its **own original palette + animation** and
  lineup, with the body ticket CTA removed (replaced by a "Past Event" tag). The
  header Tickets button on every page always points at the current on-sale event.
- **`proposal.html`** — the 14-slide residency proposal deck, adapted from the
  original PDF. Styles: `styles.css` · Script: `deck.js`.

## Theming + animations

`home.css` is palette-driven via CSS custom properties. `:root` holds the
**current event** palette (Field Day = neon green + sun orange); body theme classes
restore an archived event's palette: `theme-green` (Sidequest), `theme-blue`
(Tangle), `theme-warm` (TKF), `theme-amber` (Park Raiser). `home.js` reads the
active palette (`--accent-rgb`, `--warm-rgb`, `--knot`) off `<body>`.

The hero background is a `<canvas id="bgCanvas">` whose `data-anim` picks the
renderer in `home.js`: `grid` (default spotlight grid), `globe` (Sidequest's
rotating globe), `fieldday` (Field Day's day/night field scene — a ported palette
engine with a landscape sun/moon arc, ridges, trees, festoon and stars).
The Tangle knot is an `#tangleSvg` element the script animates when present.

To add a new event: create the new `index.html` in the current palette (pick its
`data-anim`), move the outgoing event into `events/` (add its old palette as a
body `theme-*` class), and add a node to `past-events.html`.

## Assets

- `images/tk-logo.svg` — brand knot logo (header + footer).
- `images/favicon.svg` — favicon. Brand display font is **Archivo Black**.

## Language toggle (proposal deck)

The pill in the top-right switches the whole deck between English and Spanish
using Google Translate page translation (it sets the `googtrans` cookie and
reloads). It requires the page to be served over http(s); translation will not
fire from a `file://` open.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```sh
npx serve .
```

## Navigation

- **→ / ← / Space / PageUp / PageDown**: next / previous slide
- **R** or **Home**: restart · **End**: jump to the ask
- **Swipe** left/right on touch devices
- **Click** the left/right 20% of the screen
- Bottom bar has explicit **PREV / NEXT / RESTART** controls
- Slides deep-link via hash, e.g. `#/5` opens The Tangle

## Swapping in real images

Every `NO SIGNAL` placeholder is a `div.img-slot`. Drop an `<img>` inside it and
it will fill the frame automatically:

```html
<div class="img-slot landscape" data-label="IMG·A">
  <img src="images/dan-booth.jpg" alt="Dan in the booth" />
</div>
```

## Deploy (Vercel)

```sh
git init && git add -A && git commit -m "Tight Knit × Pandora deck"
# push to GitHub, then import the repo at vercel.com to deploy as a static site
```

Or without GitHub: `npx vercel` from this folder.
