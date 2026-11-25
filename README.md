# Chess Case — landing page

Static landing page for **Chess Case**, the travel chess set for foldable phones, published by
Alpine Swift. Two native apps share one site: the iOS app (SwiftUI) built for iPhone Duo, with a
virtual lid on regular iPhones and iPads, and the Android app (Kotlin/Jetpack Compose, in
development) for Android foldables and phones. A platform switch on the landing page shows either.

English is the default; German lives alongside it.

| Page | English | German |
| --- | --- | --- |
| Landing | `index.html` | `index-de.html` |
| Support | `support.html` | `support-de.html` |
| Privacy policy – iOS | `privacy.html` | `privacy-de.html` |
| Privacy policy – Android | `privacy-android.html` | `privacy-android-de.html` |
| Legal notice | `impressum.html` | `impressum-de.html` |

`privacy-android*.html` is a pre-release notice (`noindex`), not a policy. The internal draft and the
Google Play Data safety checklist live in `internal/` (see “Privacy” below).

## Structure

```
assets/landing.css        all styles; light (ivory/maple) + dark (walnut), tokens on :root / .dark
assets/platforms.js       platform config (store links, status, privacy URLs, facts, Android gallery) + platform choice
assets/site.js            theme toggle, nav edge, scroll reveal, finish switcher, iPhone lid demo, platform switch
assets/icons.svg          icon sprite, referenced as assets/icons.svg#i-…
assets/frame-duo-inner.svg  iPhone Duo frame (ShotForge), inner display 2853×2007 at 75,75
assets/icon-*.png         generated from AppIcon.appiconset in the Xcode project
assets/img/duo-*.jpg      inner-display screenshots from the iPhone Duo simulator (iOS 27.1), app in landscape
assets/img/phone-*.jpg    iPhone 17 Pro simulator: closed case, open board, mode sheet
assets/img/tabletop.jpg   Duo tabletop view (Classic Walnut chess stage over the board)
assets/img/desks.jpg      the four tabletop desks, upper halves of four Duo captures
assets/pieces/*.webp      240 px copies of the rendered chessmen from Assets.xcassets
assets/img/android/{en,de}/  Android screens, JPEG copies of play-store/ in the Android repo (pre-release build)
internal/                 drafts that are not linked from the site (Android privacy draft, Data safety checklist)
```

Hand-written static HTML — no build step, no dependencies, no cookies, no tracking.

The finish switcher loads each board screenshot on first click. The iPhone demo stacks the
closed case over the open board; the clasp hotspot (`.clasp-hit`) sits over the latch in
`phone-case.jpg` and the lid turns around its left edge, like the 760 ms lid in the app.

`assets/img/duo-game.mp4` is a 32-second recording of the Duo simulator's inner display: a UI
test turns the device to landscape and plays Scholar's mate on Classic Walnut with smooth piece
moves, ending on the result podium. Don't rotate portrait captures: the pieces would lie on their side.
The tabletop visual tilts the two halves of `tabletop.jpg` in CSS (`.tt`).

All screenshots and the video were captured on 7 November 2026 from the app's current sources,
in a separate capture build (bundle ID `com.hildel.duochess.landing`, so saved games of installed
builds stay untouched). Like the App Store captures in `AppStore/Screenshots/english-v4`, an XCTest
drives the app and a StoreKit test session unlocks Pro (and the Legends bundle for the Viking
stage in `desks.jpg`) locally; no real purchase is involved. Install the capture app on the
simulator before the first run, or `SKTestSession` fails with `notEntitled`.

After the rename to Chess Case, `phone-case.jpg` and `phone-modes.jpg` were retaken on 22 November 2026
from a capture build with the same bundle ID, driven by hand, on an iPhone 17 Pro simulator (iOS 26.5, light mode, Classic Walnut, Pro locked),
scaled from 1206 × 2622 to 900 × 1957. The other images show no app name and were left as they were.

Pricing follows `MONETARISIERUNG.md` in the app repository (decision of 6 November 2026):
free two-player play, Chess Case Pro at US$ 9.99, ten collections at US$ 1.99 and three bundles.
Paid offers are marked “planned for launch” until purchases ship. Crystal Ice, Obsidian Gold and Pure Glass are Pro finishes;
the page doesn't name the free base finishes yet. Collector sets appear as piece line-ups.

## Platforms

One page per language serves both apps. `assets/platforms.js` runs in `<head>`, picks the platform and
sets `<html data-platform="ios|android">` before the first paint. Order: `?platform=` in the URL →
the visitor's earlier choice (`localStorage.platform`) → the device (iPhone/iPad → iOS, Android →
Android) → `defaultPlatform` (iOS). No redirects, no cookies; without JavaScript the page reads as iOS
and the switch is hidden. Links: `index.html?platform=android`, `index-de.html?platform=ios`.

In the HTML, shared copy appears once. Platform copy comes in pairs:

- `data-only="ios|android"` — a block for one platform (`display: none` otherwise).
- `data-variant="ios|android"` inside `.platform-stack` — two alternatives in one grid cell. The cell
  keeps the taller one's height, so the hero, badges and facts never jump when switching. Use it for
  anything above the fold or next to a switch.

Rendered from the config by `site.js` (the static markup is the no-JS fallback):
`[data-store]` store badges, `[data-facts]` requirement pills, `[data-gallery]` the Android gallery,
`[data-privacy]` privacy links (and with `data-privacy-label`, their footer labels).

**Change the release status / store link.** In `platforms.js` set `status` (`comingSoon`, `beta`,
`available`) and `storeUrl` or `betaUrl`. A status that needs a link falls back to “coming soon”
unless the URL matches `urlPattern` (`apps.apple.com` / `play.google.com`). When Android goes live,
consider Google's official “Get it on Google Play” badge artwork (brand guidelines) and update the
no-JS fallback badges and the “Planned for launch” notes in both landing pages.

**Add screenshots.** Put localised copies in `assets/img/<platform>/<lang>/` (JPEG, ≤1440 px on the
long side; `sips -s format jpeg -s formatOptions 82 -Z 1280 in.png --out out.jpg`). Gallery images
are a `gallery` entry in `platforms.js` (file, size, alt and caption per language). Images in a
section are plain `<img>` with `width`, `height` and `loading="lazy"`. Never show iOS captures as
Android ones, and label pre-release screens.

**Maintain platform features.** Edit the `data-only` / `data-variant` blocks in both `index.html` and
`index-de.html`; keep them structurally identical (same count of `data-only`). Describe a feature for a
platform only once it exists in that app (check `IMPLEMENTATION_STATUS.md` in the Android repo).

**Privacy policies.** Each platform has its own stable URLs per language in `privacy` of the config.
Every policy page is plain HTML (readable without JavaScript, printable) with a platform/language
switch (`.doc-switch`). Until the Android policy is reviewed, `privacy.final` is `false`: footers say
“pre-release” and the page carries `noindex`. Steps to publish are at the end of
`internal/android-privacy-draft.md`.

**Add a platform.** Add an entry to `platforms` in `platforms.js` (and to `detect()` if the device can
be recognised), a button with `data-set-platform="…"` to each `.platform-switch`, the matching
`[data-only]`/`[data-variant]` blocks and the hide rules at the top of the “Platforms” section in
`landing.css` (they currently cover two platforms), plus privacy pages and footer links.

## Before launch

- Set `storeUrl` and `status: 'available'` for iOS in `assets/platforms.js` (badges are rendered
  from there; update the static fallback badges too).
- Canonical, `hreflang`, `og:url` and `og:image` use `https://v4ulthunt3r.github.io/ChessCase/`.
  If a custom domain is added (`CNAME`), replace that prefix in all pages and the JSON-LD.
  `robots.txt` only works at the host root, so a sitemap belongs in Search Console.

## Local preview

```bash
python3 -m http.server 4176
```
