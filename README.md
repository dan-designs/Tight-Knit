# Tight Knit & Friends // 001 · Event site

A small static site for the Tight Knit & Friends 001 event at Pandora, Richmond
VA. Pure static HTML/CSS/JS — no build step, no dependencies.

## Pages

- **`index.html`** — the event landing page. Hero with the lineup lockup over an
  animated cyber-grid + dual-spotlight canvas (ported from the flyer), the two-room
  bill, date/venue/doors, a teaser into the proposal, and a shared header/footer.
  Primary CTAs link to tickets on Shotgun:
  <https://shotgun.live/en/events/tight-knit-friends-001>
  Styles: `home.css` · Script: `home.js`.
- **`proposal.html`** — the 14-slide residency proposal deck (formerly the home
  page), adapted from the original PDF. Linked from the nav; the top-left brand
  links back to the event page. Styles: `styles.css` · Script: `deck.js`.

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
