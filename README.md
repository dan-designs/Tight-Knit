# Tight Knit · Event site

A small static site for Tight Knit — an independent event promotion group in
Richmond, VA. The home page is always the **current on-sale event**; past events
are archived, each preserved as it appeared when it was live. Pure static
HTML/CSS/JS — no build step, no dependencies.

## Pages

- **`index.html`** — the current event landing page (**The Tangle // 001**, Aug 8
  2026). Hero with the lineup lockup, the animated **Tangle knot** centerpiece +
  cyber-grid/spotlight canvas, the two-room bill, details, a teaser, and a shared
  header/footer. Buy-tickets CTAs → the current Shotgun event.
  Styles: `home.css` · Script: `home.js`.
- **`past-events.html`** — the **"Follow the Thread"** archive: a woven SVG thread
  (generated in JS through each event node) that winds between event cards. Each
  node links into that event's preserved page and carries its own accent color.
- **`events/*.html`** — archived event snapshots (e.g. `events/tkf-001.html`,
  Tight Knit & Friends // 001). Each keeps its **own original palette** and lineup,
  with the body ticket CTA removed (replaced by a "Past Event" tag). The header
  Tickets button on every page always points at the current on-sale event.
- **`proposal.html`** — the 14-slide residency proposal deck, adapted from the
  original PDF. Styles: `styles.css` · Script: `deck.js`.

## Theming

`home.css` is palette-driven via CSS custom properties. `:root` holds the
**current event** palette (The Tangle = ice blue); adding `class="theme-warm"` to
`<body>` restores the archived TKF 001 palette (red/orange). `home.js` reads the
active palette (`--accent-rgb`, `--warm-rgb`, `--knot`) off `<body>`, so one
script recolors the canvas + knot per page. To add a new event: create the new
`index.html` in the current palette, move the outgoing event into `events/`, add a
node to `past-events.html`.

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
