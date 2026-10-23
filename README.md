# Roshan Sahu — Video Editing Portfolio

A cinematic, 3D, fully interactive portfolio that carries over **everything** from the old
Wix site (mjroshansahu786.wixsite.com/job-portfolio) — plus new sections: stats,
stack, work cards, lightbox and copyable contacts.

## Run it

Any static host works (Netlify, Vercel, GitHub Pages, S3…). Locally:

```bash
cd roshan-portfolio
python3 -m http.server 8000
# open http://localhost:8000
```

(Double-clicking `index.html` also works — all libraries are CDN + classic scripts.)

## All content lives in `index.html`

Edit text like any normal page:

| Old-site item                                    | Where it lives now            |
| ------------------------------------------------ | ----------------------------- |
| Bio "I bridge creativity with strategy…"         | `#about` section              |
| Best short video edit                            | `#best` — the "Best Edit" video (Dragonfruit Media cut) |
| AI Avatar / Social / Ads services                | `#services` — 3 cards, each playing a real Instagram reel |
| "Worked For" channels + subscriber counts        | `#clients` `.chan-row`        |
| Vodafone Idea, RCB, Zepto, Zoho, Cleartrip…      | `#clients` brand marquees     |
| PR + AE = 🔥                                     | `#stack` equation             |
| Email / phone / WhatsApp / Instagram / X         | `#contact` + footer           |
| "All rights reserved. All wrongs reversed."      | Footer (kept 😄)              |
| *(new)* 12 real shorts from @techielashorts      | `#reel` drag strip + lightbox |

## Add your photos

The portrait is in place — the About section's photo slot now shows Roshan's
headshot automatically:

```
assets/img/roshan.jpg      ← portrait (1080×1920, currently in use)
```

To swap it for a different shot, just replace that file — no code changes
needed. The slot auto-detects on load (also accepted: `roshan.png`,
`portrait.jpg`, `me.jpg` — first one found wins) and fills the framed viewfinder
with `object-position: 50% 18%` so faces crop well.

## The real videos (how it works now)

Three kinds of real footage play inside the lightbox — the iframe mounts on open
and is killed on close, so nothing plays in the background:

1. **Best Edit (`#best`, before "01 — Who I am")** — the "Edit for Dragonfruit
   Media" YouTube upload on a 16:9 poster card. `data-video="XC7ye9mZS6o"`,
   with `data-watch` (YouTube deep-link) and `data-note` overrides.
2. **Service reels (`#services`)** — 3 cards, each with a real Instagram poster
   (`assets/reels/<ID>.jpg`) and `data-embed` → `instagram.com/reel/<ID>/embed/`:
   Varun Mayya (AI avatar), The Fincredibles by South Indian Bank (social),
   100xEngineers (advertising).
3. **Shorts feed (`#reel`)** — the actual shorts — 24M+ views "Unexpected Gift",
   "China Tech EP-06", the Galaxy S26 Ultra collab and 9 more — pulled straight
   from the [@techielashorts](https://www.youtube.com/@techielashorts/shorts)
   channel (verified via YouTube oEmbed; 48 shorts exist, 12 headline featured).
4. **Selected work (`#work`)** — two real uploads on poster cards: the
   InfraMarket long-form cut for Exploring Minds (`ifuNiJM9pcY`, 16:9) and
   "Zerodha TOS Escrow" from Roshan's own channel (`YfP6STSUoUI`, vertical).

- **`#reel` strip** — a draggable, scroll-snapping row of 9:16 cards. Each card is a
  `<button class="reel-card" data-video="VIDEO_ID">` with its poster image in
  `assets/work/<VIDEO_ID>.jpg`. Clicking opens the lightbox with the real
  `youtube-nocookie` embed (iframe src is only set on open, and killed on close,
  so nothing plays in the background).
- **Work cards** — every project card carries `data-video="ID"`:
  its lightbox shows that actual short instead of the placeholder art.
  Cards *without* `data-video` keep the poster-art lightbox behaviour.
- **Swap or add a short**: copy its thumbnail to `assets/work/<ID>.jpg`
  (`https://i.ytimg.com/vi/<ID>/oar2.jpg` gives the vertical 1080×1920 poster),
  then either add a new `.reel-card` in `index.html` or change a `data-video`
  value. Titles/view counts are display labels — keep them accurate.
- The lightbox note ("REPRESENTATIVE EDIT…", "FULL REEL…") and the YouTube
  deep-link on the watch button swap automatically per card.

## Tech inside

- **Three.js (r128)** — draggable film-frame ring + drifting dust in the hero
- **GSAP + ScrollTrigger** — split-line headings, reveals, counters, magnetic buttons
- **Lenis** — smooth inertia scrolling
- **Zero build step** — plain HTML/CSS/JS, classic script tags, works over `file://`

## Notes

- Honors `prefers-reduced-motion` (calm fallbacks everywhere).
- Reel posters (`loading="lazy"`) stream in as you scroll/drag; YouTube iframes
  mount only while the lightbox is open.
- The reel strip ignores click-opens after a real mouse drag — but Enter/space
  on a focused card still opens normally (keyboard users unaffected).
- Film frame textures in the 3D ring are generated in code (`js/three-scene.js`) —
  swap the `titles` array if you want different words.
- The fire gif is Roshan's own uploaded asset, pulled from the old site alongside every
  channel/brand logo (now in `assets/logos/` so nothing hotlinks to Wix).
