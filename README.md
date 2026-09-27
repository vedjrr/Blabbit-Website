# Blabbit website

Static marketing and download site for [Blabbit](https://github.com/vedjrr/Blabbit). No build step, no cookies, no analytics, and no third-party requests: fonts are self-hosted, and a Content-Security-Policy meta tag allows only this site's own files.

```
index.html          the page
assets/styles.css   styles
assets/main.js      motion: throwable word-pile hero (Matter.js physics), pinned dictation scene driven by scroll, manifesto reveal, speed counters, feature loops, listening orb (a port of the app's Orb.swift)
assets/vendor/      GSAP 3.13 + ScrollTrigger and Matter.js 0.20 (MIT), vendored so nothing loads from a CDN
assets/fonts/       Instrument Serif, Mona Sans and Monaspace Neon (all OFL)
assets/img/         app icon
```

Preview locally: `python3 -m http.server 8787`, then open http://127.0.0.1:8787.

Deploy: Vercel, as a static site with no build step (`npx vercel` from this folder, or import the repo; framework preset "Other"). `vercel.json` sets the security headers. Every download button points to `https://github.com/vedjrr/Blabbit/releases/latest/download/Utter.dmg`, which always serves the newest release, so a new version needs no change here.
