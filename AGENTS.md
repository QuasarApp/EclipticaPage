# AGENTS.md — EclipticaPage

Instructions for AI agents and contributors working in this repository.

## 1. Project overview

* `EclipticaPage` is the **official landing page** of the video game *Ecliptica* (first-person open-world colony survival simulator, QuasarApp Core, 2026 release).
* Live site: https://ecliptica.me (custom domain set in `CNAME`).
* Stack: **Jekyll 4.3** static site, `minima` theme base, plugins `jekyll-seo-tag`, `jekyll-sitemap`, `jekyll-feed`. Deployed to **GitHub Pages** automatically on push to `main` by `.github/workflows/jekyll-gh-pages.yml`.
* This is a website repository: **no game code, no CMake, no Qt, no Python**. Do not add build systems, package managers (npm), or scripts that do not belong to the Jekyll workflow.

## 2. Repository layout (what touches the page)

| Path | Role |
|---|---|
| `_data/translations.yml` | **Single source of truth** for all visible text, 14 languages |
| `_layouts/default.html` | `<head>` SEO, hreflang, navbar, language switcher, lightbox markup |
| `_layouts/landing.html` | Page sections (hero, features, trailer, visuals, FAQ, social, footer) — pulls keys via `site.data.translations[page.lang]` |
| `index.md` | English (root) page; `be/ de/ el/ es/ fr/ hi/ it/ jp/ pl/ ru/ sr/ ua/ zh/index.md` — one per language, only sets `lang:` in frontmatter |
| `assets/css/style.css` | All styling; CSS variables (`--secondary`, `--glass-border`, fonts) are shared — extend, don't fork |
| `assets/js/main.js` | Background trailer video, language switcher + auto-detect (`supportedLangs`), scroll effects, spawn/reveal animations, screenshot lightbox, lore console easter egg |
| `assets/sceenshots/` | Gameplay screenshots. Directory name `sceenshots` (misspelled) is historical and referenced from `_layouts/landing.html` — **do not rename** without updating the layout in the same commit |
| `sw.js` / `manifest.json` | PWA service worker (network-first) and web app manifest |
| `ai.txt` / `robots.txt` / `indexnow_key.txt` / `_includes/game_schema.html` | SEO + AI crawler context — keep in sync with game facts, never delete |

## 3. Developing process

1. Work on branch `task_<issue-number>` created strictly from `main` (run `git pull` first).
2. Make minimal, reviewable diffs. One concern per commit.
3. **Copy/text changes**: edit `_data/translations.yml` only. Never hardcode user-visible strings into layouts, HTML, or JS.
4. **Adding a language** (all three, in the same commit):
   1. new language block in `_data/translations.yml` with the same key set as `en`,
   2. new `<lang>/index.md` with `layout: landing` + `lang: <code>`,
   3. `link rel="alternate" hreflang` entry in `_layouts/default.html`.
   Optionally add the code to `supportedLangs` in `assets/js/main.js` if browser auto-redirect should include it.
5. **New screenshots**: put the file into `assets/sceenshots/` and add an `<img class="spawnable" ...>` entry in the visuals section of `_layouts/landing.html` with a meaningful `alt` (SEO).
6. **New FAQ entry**: append `faq_qN` / `faq_aN` pairs in `_data/translations.yml`; the FAQ loop renders while `faq_q1..14` exist — for more than 14 questions, extend the loop range in `_layouts/landing.html`.
7. **Never**:
   * rename `assets/sceenshots/` or change `CNAME`, `indexnow_key.txt`, `sw.js` structure without a clear reason;
   * change the `url:` / `baseurl:` in `_config.yml` (breaks hreflang, sitemap, PWA start URL);
   * remove `spawnable` classes or the spawn/reveal logic in `assets/js/main.js` (reviewed animation behavior: blocks spawn in document order at 10% visibility, staggered — see comments in `main.js`);
   * introduce Python code, npm tooling, or any runtime besides the Jekyll + vanilla JS/HTML/CSS stack.

## 4. Testing process (smoke tests)

There is no test framework in this repo. The smoke gate for **every** change is a clean strict build plus a diff sanity check:

```bash
# 1. Install dependencies (Ruby)
gem install bundler
bundle install

# 2. Strict build — must finish with "Jekyll is not running" / no errors
bundle exec jekyll build --strict

# 3. Verify expected outputs exist in _site/
test -f _site/index.html
for l in be de el es fr hi it jp pl ru sr ua zh; do
  test -f "_site/$l/index.html"
done
grep -q "CACHE_NAME = 'ecliptica-v" _site/sw.js
grep -q "ecliptica.me" _site/CNAME

# 4. If you touched precached assets (/assets/css/style.css, /assets/js/main.js,
#    /assets/images/ecliptica_main_banner.png or the root page), confirm
#    sw.js CACHE_NAME was bumped in the same commit.

# 5. Diff check before pushing
git --no-pager diff main...task_<issue-number> --stat
```

Local visual check (optional but recommended for layout/animation changes):

```bash
bundle exec jekyll serve   # open http://127.0.0.1:4000 and /ru/
```

## 5. Delivery checklist (per task)

- [ ] branch `task_XXX` from up-to-date `main`
- [ ] `bundle exec jekyll build --strict` passes
- [ ] all 14 language pages build into `_site/<lang>/index.html`
- [ ] PWA cache name bumped if a precached asset changed
- [ ] `git diff` reviewed (Markdown-friendly, no typos)
- [ ] push branch, open PR against `main`
- [ ] issue labeled `waiting-for-review`, checklist comment updated

## 6. Key links

* Steam: https://store.steampowered.com/app/3723390/Ecliptica/
* Discord: https://discord.gg/FRpw2565Sy
* Game repo: https://github.com/QuasarApp/Ecliptica (separate project — do not mix changes)
