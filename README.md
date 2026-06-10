# Tight Knit × Pandora · Residency Proposal Deck

A 13-slide web presentation adapted from the original PDF proposal. Pure static
HTML/CSS/JS. No build step, no dependencies.

## Language toggle

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

## Editing contact info

The bracketed placeholders (`[ EMAIL ]`, `[ PHONE ]`, `[ IG / YOUTUBE / INFOLINES.IO ]`)
live on the final slide in `index.html`. Search for `TK·12`.

## Deploy (Vercel)

```sh
git init && git add -A && git commit -m "Tight Knit × Pandora deck"
# push to GitHub, then import the repo at vercel.com to deploy as a static site
```

Or without GitHub: `npx vercel` from this folder.
