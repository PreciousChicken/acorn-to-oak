# Acorn to Oak Forest School — website

Static brochure site for Acorn to Oak Forest School, Leeds
(https://www.acorn-to-oak.co.uk). Plain HTML/CSS/JS — no server-side runtime
required to view or deploy the site.

## Licensing

- **Code** (HTML/CSS/JS): MIT, © PreciousChicken. See `LICENSE-CODE`.
- **Copy and photographs**: CC BY-NC-ND 4.0, © Dan Ward. See `LICENSE-CONTENT`.

## Architecture

- **Tailwind CSS v4** via `@tailwindcss/cli`, CSS-first config (the `@theme`
  block in `input.css` — colour palette, fonts — no `tailwind.config.js`,
  no PostCSS). Compiled once to a committed `assets/css/site.min.css`; the
  deployed site does not run Tailwind or Node.
- **No framework, no bundler.** `assets/js/main.js` is plain JS: the mobile
  nav toggle and an accessible gallery lightbox. Anchor smooth-scroll is pure
  CSS (`scroll-behavior: smooth` plus `scroll-margin-top` per `section[id]`,
  with a `prefers-reduced-motion` override).
- **Self-hosted fonts**: Fraunces (display/headings) and Work Sans (body),
  vendored from `@fontsource/*` npm packages into `assets/fonts/` as woff2,
  referenced via `@font-face` in `input.css`. No Google Fonts runtime call.
- **Images**: optimized one-off via `vipsthumbnail` and `imagemagick` — see
  "Regenerating images" below. Not version-controlled — see "A note on
  photography" below.

### Folder layout

```
index.html                 Source of truth — the entire site (single page, anchored sections)
input.css                  Tailwind v4 source (@theme palette/fonts, @font-face, base layer)
assets/
  css/site.min.css          Built output of input.css — do not hand-edit, regenerate it
  js/main.js                 Vanilla JS: mobile nav toggle + gallery lightbox
  fonts/fraunces/, work-sans/   Self-hosted woff2, copied from @fontsource/* packages
  images/
    logo/                    Processed site logo marks (tracked in git — the one photography exception)
    favicon/                 favicon.ico, apple-touch-icon.png, icon-512.png (tracked, derived from the logo)
    hero/, content/, gallery/, team/   Optimized site photography (NOT tracked in git — see below)
images/                     Dev-only source photography, raw (NOT deployed, NOT tracked in git)
docs/                       Dev-only briefing docs and source copy text, e.g. bios (NOT deployed, NOT tracked in git)
robots.txt, sitemap.xml     SEO baseline
LICENSE-CODE, LICENSE-CONTENT   MIT (code) / CC BY-NC-ND 4.0 (content)
package.json, package-lock.json, shell.nix   Build-only tooling, not deployed
README.md                   This file
AGENTS.md                   Agent-facing project notes
```

`index.html` sections, in order (anchor IDs): `#home #approach #seasons
#gallery #sessions #fees #team #safety #booking #contact`.

## A note on photography

Per the client's preference, **photos of children are not stored in git** —
only the site logo/favicon (which are graphics, not photography) are
tracked. `assets/images/{hero,content,gallery,team}/` and the top-level
`images/` (raw source photography) are gitignored but still present on disk
in a normal working copy — the site works locally and deploys exactly as
before, they're just not part of the repository history.

**This means the working directory is the only copy of that photography.**
Losing it (disk failure, accidental `git clean -x`, a fresh clone) loses the
images for good unless you have a separate backup of `images/` and the
processed `assets/images/` output. That's a deliberate tradeoff, not an
oversight.

## Dev setup (Nix)

```bash
nix-shell             # drops into a shell with node, vips, imagemagick
npm install            # installs Tailwind + font packages (dev-only)
```

## Building

```bash
npm run build:css      # compiles input.css -> assets/css/site.min.css (minified)
npm run watch:css      # same, but rebuilds on change while editing
```

### Regenerating images

Source photography lives in `images/` (raw) and is
processed with `vipsthumbnail` (resize, re-encode to webp, `strip` EXIF —
important since these are photos of children on a public server) into
`assets/images/{hero,content,gallery,team}/`. Example:

```bash
vipsthumbnail /abs/path/to/source.jpg --size 1400 -o /abs/path/to/assets/images/content/name-1400.webp[Q=82,strip]
```

Always use **absolute** input/output paths — relative `-o` paths get wrongly
joined against the input file's directory.

The logo/favicon set is derived from the client-supplied logo artwork via
`imagemagick` (`-transparent white` to knock out the background, `-trim` to
tighten, then resized) and `vipsthumbnail` (final webp encode). Regenerate
only if the client supplies new artwork — see AGENTS.md for the exact recipe
used.

## Previewing locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Deploying

The site is a pure static payload — `index.html`, `assets/`, `robots.txt`,
`sitemap.xml`, `LICENSE-CODE`, `LICENSE-CONTENT` — with no build step or
Node runtime needed on the server. Upload exactly that payload, nothing else:

```bash
rsync -av --delete \
  index.html assets robots.txt sitemap.xml LICENSE-CODE LICENSE-CONTENT \
  user@host:/path/to/document/root/
```

This is a whitelist, not a blacklist — new dev-only files (scratch notes,
tooling config, sample content) never leak to the server by accident, because
nothing gets deployed unless it's named here.

The exact host and remote path are the client's own hosting details and are
deliberately not recorded in this repo — ask whoever is running the deploy.

## Outstanding before fully live

- Real Instagram/Facebook links (currently placeholders pointing to `#`)
- Confirmed safety/insurance/qualifications wording (currently generic
  placeholder, flagged on-page in `#safety`)
- Live booking system link once procured (currently a `mailto:`/`tel:` CTA,
  marked with an HTML comment in `index.html`)
