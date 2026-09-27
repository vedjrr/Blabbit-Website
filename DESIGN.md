---
name: Blabbit
description: Free, open-source, on-device dictation for macOS. A light page that opens on a throwable pile of spoken words, then one pinned scroll scene shows voice becoming text.
colors:
  bone-paper: "#f3f1ec"
  paper-shade: "#e9e6df"
  window-white: "#fffdfa"
  ink: "#111114"
  ink-secondary: "#45464d"
  ink-tertiary: "#74757c"
  hairline: "#dedad2"
  key-border: "#d3cfc6"
  violet: "#5b45e0"
  teal: "#11a59b"
  voice: "#0e8f88"
  voice-soft: "#d9f1ee"
  overlay-pill: "#1c1c21"
  strike-red: "#e5484d"
  violet-on-ink: "#b3a8ff"
  aurora-violet: "#b9adff"
  aurora-teal: "#9fe6dc"
  aurora-peach: "#ffd6b8"
  chrome-close: "#ff5f57"
  chrome-minimize: "#febc2e"
  chrome-zoom: "#28c840"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, system-ui, Segoe UI, Helvetica Neue, sans-serif"
    fontSize: "clamp(52px, 8.4vw, 104px)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  display-md:
    fontFamily: "SF Pro Display (system)"
    fontSize: "clamp(40px, 5.6vw, 64px)"
    fontWeight: 600
    lineHeight: 1.0625
  display-sm:
    fontFamily: "SF Pro Display (system)"
    fontSize: "clamp(32px, 4vw, 48px)"
    fontWeight: 600
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, Segoe UI, Helvetica Neue, sans-serif"
    fontSize: "17px"
    lineHeight: 1.6
  mono:
    fontFamily: "ui-monospace, SF Mono, SFMono-Regular, Menlo, Consolas, monospace"
rounded:
  inline: "5px"
  icon: "7px"
  window: "16px"
  card: "26px"
  dark-card: "32px"
  pill: "999px"
---

# Blabbit design system

## Thesis

Voice becoming text, shown with play. The page is quiet paper and big Apple-style SF type. It opens on a floating Blabbit wordmark and a plain-spoken tagline, with a few spoken words falling into a pile the visitor can throw around. Then one pinned scroll scene, where scrolling acts as holding ⌥ Space, shows the product at work. The user rejected three earlier versions: a dark neon-glow page ("AI slop"), a calm light page with no motion story ("too basic"), and a hero built around a dotted listening-orb sphere (not fun enough).

## Type

- **SF Pro Display** (system font, semibold, tight tracking, set like apple.com) for every headline, the manifesto and big numbers. Emphasis is colour, not italics: one phrase per headline in solid violet on paper or soft violet on ink. No gradient text. No web fonts are loaded.
- **SF Pro** (system font) for body copy, UI and buttons. **SF Mono** (system) for keys, timers and code.

## Colour

Bone paper and ink do almost all the work. Violet (from the app icon) marks the emphasised phrase in a headline and the spoken "ghost" words in the demo. Teal and voice-soft mark live or corrected text. The soft aurora (violet, teal, peach blurred circles) appears only under the hero and the closing call to action. The speed section is the one dark block.

## Page story

1. **Hero (floating wordmark + falling words, one viewport):** the "Blabbit" wordmark is one chunky violet block that pops in and floats (a slow bob and tilt); clicking it squashes it and it blabs three words. Under it, the visible `h1` tagline "Talk instead of typing. Free dictation for your Mac." (second sentence in violet), then the lede, Download and GitHub buttons, meta line and a violet hint. Spoken-word chips fall (30 on wide screens, 20 on tablets, 13 on phones), spread across the width and nearly flat, into a pile under the copy; they pass behind the text and never collide with it. The chips are pills in lilac, mint, peach, violet, teal, ink and white, plus ⌥ and Space keycaps. Physics is Matter.js, vendored, and chips resist spinning so most stay readable. Visitors can grab any word and throw it; clicking or tapping empty space pops out a new word, with at most 20 extra words kept. The pile is `aria-hidden`. Static fallback: the chips sit in a loose, tilted, wrapped heap under the copy.
2. **Demo (pinned, about 3.2 viewports):** "Hold ⌥ Space." shows first while a tilted Mail window waits below. Scrolling raises the window flat, captions narrate Hold → Just talk → Let go, ⌥ Space keys press, the pill's orb and waveform go live, spoken words float up from the pill in violet and land in the email as text. "6, sorry, 5 p.m." strikes the 6 and highlights 5 p.m.
3. **Manifesto:** one large semibold paragraph on "free"; words fill from faint to ink as you scroll.
3b. **New to dictation:** "Never dictated before? You already know how." with four plain use-case cards (messages, email, notes, resting your hands), each led by a violet spoken line. For the general-Mac-user audience.
4. **Speed (dark card):** 75 ms, 0.3 s and 0 bytes count down to their real values; bars race to scale.
5. **Features bento:** four cards with small looping demos (spoken correction, vocabulary, apps with a skipped password field, model marquee), then a one-line row of extras.
6. **Install:** four numbered steps, a drawn (HTML, not screenshot) System Settings "Open Anyway" row showing step 2 up close, plus the `xattr` command with a copy button.
7. **FAQ** (includes "Is it listening all the time?" and "Do I need to be good with computers?"), a **maker note** ("Made by Ved, in the open", initial avatar, links to GitHub issues and stars), **closing CTA** over the aurora, **footer**.
8. **Download dialog:** every `[data-download]` button opens a native `<dialog>`. On a Mac the download proceeds and the dialog lists the four next steps; on phones, iPads and other systems the click is held and the dialog explains Blabbit is a Mac app, with Star on GitHub and Download anyway. Detection reads the user agent only; nothing is stored or sent.

## Motion rules

- GSAP + ScrollTrigger and Matter.js, vendored. Only the demo pins. Other sections use one-time entrances or scrubbed reveals.
- Feature loops play only while their card is on screen.
- `prefers-reduced-motion` or no JavaScript: no `js-motion` or `js-physics` class, so the word pile is a static heap, the demo lays out as a normal static page with the finished email, and all CSS animations stop.

## Hard constraints

No third-party requests, cookies or analytics (CSP allows only 'self'). No invented testimonials, logos or numbers: every figure traces to `utter-kit/docs/BENCHMARKS.md`.
