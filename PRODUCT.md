# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS, hosted on Vercel. Animation with GSAP (plus ScrollTrigger), vendored into the site so every file loads from the site's own origin. The user asked for "a GSAP site full of smooth animations which can sell the app". There is no build step and no npm runtime.

## Users

Two audiences, both confirmed:
1. Mac power users and developers who type all day (devs, writers, founders). Many already know paid dictation apps like Wispr Flow or Superwhisper and judge on speed, accuracy and polish.
2. General Mac users who would rather talk than type and have never used a dictation app. They need to see what it does and trust that installing it is easy.

The site's job is to get them to download the DMG.

## Product Purpose

Blabbit is a native macOS menu-bar dictation app. You hold a shortcut (⌥ Space by default, configurable to fn, a right-side modifier or any combination), speak, and let go, and your words appear at the cursor in any app. Transcription runs entirely on the Mac (Apple Silicon, Metal).

## Positioning

The differentiator the user chose to lead with is **free and open source**: MIT licence, code on GitHub, no subscription and no account, against paid, subscription-based competitors. On-device privacy, speed and being a native app are supporting truths, not the headline.

## Operating Context

- **Download:** the DMG comes from GitHub Releases (`https://github.com/vedjrr/Utter/releases/latest/download/Utter.dmg`, always the newest release). No release was published as of 2026-09-26.
- **First launch:** Blabbit is not notarised (there's no paid Apple Developer account), so the first launch needs System Settings → Privacy & Security → Open Anyway, or `xattr -dr com.apple.quarantine /Applications/Utter.app`.
- **Permissions:** the app asks for Microphone and Accessibility. The Models page then recommends downloading Parakeet V2 (730 MB, English).
- **Updates:** installed via Sparkle, EdDSA-signed.

## Capabilities and Constraints

Facts from the app's README and PROGRESS.md (repo `~/Documents 2/utter-kit`):
- **Speed:** Parakeet V2 transcribes about 5 s of speech in about 75 ms. A 5-minute dictation is ready about 0.3 s after release.
- **Typing as you speak:** words type into the field while you talk and settle at each pause.
- **Spoken self-corrections:** English only, in the Clean, Code, Professional and Custom modes. "at 6 p.m., sorry, 5 p.m." gives "at 5 p.m.", and "scratch that" drops the sentence before it.
- **Insertion:** through Accessibility where possible, falling back to paste (the clipboard is restored) or typing, and chosen per app. It never types into password fields.
- **Personal vocabulary:** corrects mishearings of names and jargon.
- **Modes:** Exact, Clean, Code, Professional, Custom. The optional AI processor is Ollama (local) or Anthropic (opt-in, blocked by Local-only mode, which is on by default).
- **Models:** 15 families: Parakeet V3/V2, Whisper Small/Medium/Large v3/Large v3 Turbo, SenseVoice Small, Moonshine Base, Cohere Transcribe, Canary 180M Flash, Qwen3-ASR, Nemotron Speech, Granite Speech, Fun-ASR and MOSS, most with a 4-bit variant, plus the user's own GGUF file. Each shows accuracy and speed out of 100.
- **History:** local, searchable, text only by default.
- **Network:** used only for model downloads, update checks, and Anthropic if the user chooses it.
- **Requirements:** macOS 14 or later, Apple Silicon only. The app is in English only for 1.0.
- **Website constraint:** no trackers, analytics or cookies, and no requests to third-party origins (fonts and libraries are self-hosted).
- **Open decision:** user counting and analytics were deliberately deferred by the user.

## Brand Commitments

- **Name and author:** Blabbit. © 2026 Ved (Vedjr02), MIT.
- **App icon** (`assets/img/icon-256.png`): white waveform bars on a violet-to-teal gradient squircle.
- **Listening orb:** the app's overlay uses a dotted "thinking orb" (a port of thinking-orbs by Jakub Antalik, MIT, credited in the app's About).
- **Sibling project:** the author also ships Hold My Code.

## Evidence on Hand

- Measured benchmarks are in `utter-kit/docs/BENCHMARKS.md`.
- Real app UI renders are in `utter-kit/evidence/m7/ui2/` (overlay, menu panel, settings, history). Some show dev states, such as "Starting…" or a permission warning.
- There are no testimonials, user counts, press or customer logos, and none may be invented.

## Product Principles

1. Free means free: never imply a paid tier, trial or account.
2. Show the product working, not claims about it. Every number must trace to a measured benchmark.
3. Be honest about friction: the one-time Open Anyway step is explained, not hidden.
4. The site must match the product's privacy: nothing loads from anyone else.

## Accessibility & Inclusion

Respect prefers-reduced-motion: every GSAP sequence needs a static equivalent. Keep text real, not baked into images.
