# Ecliptica Game Page

This is the main source of the official [Ecliptica](https://ecliptica.me) game site — a Jekyll static website for the first-person open-world colony survival simulator developed by QuasarApp Core.

If you detect mistakes or wrong translations please make a pull request.

## Tech stack

| Part | Technology |
|---|---|
| Static site generator | Jekyll 4.3 (`theme: minima`, plugins: `jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-feed`) |
| Deployment | GitHub Pages via `.github/workflows/jekyll-gh-pages.yml` (automatic on push to `main`) |
| PWA | `manifest.json` + `sw.js` (network-first service worker) |
| SEO / AI | `ai.txt`, `robots.txt`, `indexnow_key.txt`, hreflang tags, JSON-LD (`_includes/game_schema.html`) |

## Repository structure

```
.
├── index.md                  # English (default) landing page, layout: landing
├── be/ de/ el/ es/ fr/ hi/   # Localized landing pages (one index.md per language)
├── it/ jp/ pl/ ru/ sr/ ua/ zh/
├── _data/translations.yml    # Single source of truth for ALL visible text (14 languages)
├── _layouts/default.html     # Navbar, language switcher, hreflang, SEO meta
├── _layouts/landing.html     # Page sections: hero, features, trailer, visuals, FAQ, social
├── _includes/game_schema.html
├── assets/
│   ├── css/style.css         # All styling (CSS variables, spawn/reveal animations)
│   ├── js/main.js            # Background video, lang switcher/auto-detect, lightbox, spawn animations
│   ├── images/               # Banners, icons, capsule art
│   ├── sceenshots/           # Gameplay screenshots (directory name is historical — referenced by _layouts/landing.html, do not rename)
│   └── videos/               # Trailer (used as blurred page background)
├── manifest.json             # PWA manifest
├── sw.js                     # Service worker (CACHE_NAME must be bumped on precache changes)
├── ai.txt                    # Context block for LLM crawlers (ChatGPT-Bot, Claude-Bot, Gemini-Bot)
├── robots.txt                # Crawler rules + sitemap URL
├── indexnow_key.txt          # IndexNow verification key
├── CNAME                     # Custom domain: ecliptica.me
└── _config.yml               # Site config (title, url, social, jekyll plugins)
```

## Translations

* All user-visible text lives in `_data/translations.yml` as `key: value` pairs grouped per language. The layouts pull `site.data.translations[page.lang]`.
* Each language has its own directory with a minimal `index.md` that only sets `lang:` in the frontmatter.
* Supported languages (14): `en` (root), `ru`, `ua`, `fr`, `de`, `jp`, `zh`, `pl`, `hi`, `be`, `sr`, `it`, `es`, `el`.
* Browser auto-detection (`assets/js/main.js`) currently only redirects for: `en, ru, ua, fr, de, jp, zh`.
* Adding a language = new block in `translations.yml` + new `<lang>/index.md` + hreflang link in `_layouts/default.html`. Keep all keys consistent across every language block.

## Local development

```bash
gem install bundler
bundle install          # installs Jekyll 4.3 + plugins from Gemfile
bundle exec jekyll serve   # http://127.0.0.1:4000
```

Smoke test (what CI effectively runs before deploy):

```bash
bundle exec jekyll build --strict   # must finish without errors
```

## Deployment

Pushes to `main` trigger `.github/workflows/jekyll-gh-pages.yml`: build with Jekyll → upload artifact → deploy to GitHub Pages (`ecliptica.me` via `CNAME`). No manual steps needed.

## PWA cache rule

`sw.js` precaches `/`, `/assets/css/style.css`, `/assets/js/main.js` and the main banner under a versioned `CACHE_NAME` (e.g. `ecliptica-v7`). **Whenever you change one of the precached assets, bump the `CACHE_NAME` version** so returning visitors drop the stale cache.

## Contribution

Translation fixes, new screenshots, FAQ entries and copy edits are welcome. Open a pull request against `main`; the workflow deploys it automatically on merge.

