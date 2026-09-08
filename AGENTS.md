# AGENTS.md

Agent-facing notes for the Acorn to Oak Forest School website. Keep this file
up to date: when you finish a task, move it from "Outstanding work" into a
short changelog note; when you learn something a future agent would want to
know before touching this repo, add it here rather than only saying it in
chat.

## What this project is

A single-page static brochure site for Acorn to Oak, a small Forest School
run by Dan and Katy at Kirkstall Valley Farm, Leeds. Plain HTML/CSS/JS, no
server runtime — deploys as flat files to Apache. Site copy and photos are
the client's own content; the code is a separate MIT-licensed deliverable
credited to PreciousChicken (see `LICENSE-CODE` / `LICENSE-CONTENT`).

Platform is NixOS — all tooling is invoked through `nix-shell`/`shell.nix`,
never assumed to be globally installed.

## Repo layout

```
index.html              Source of truth — the entire site (single page, anchored sections)
input.css               Tailwind v4 source (@theme palette/fonts, @font-face, base layer)
assets/
  css/site.min.css       Built output of input.css — DO NOT hand-edit, regenerate it
  js/main.js              Vanilla JS: mobile nav toggle + gallery lightbox
  fonts/fraunces/, work-sans/   Self-hosted woff2, copied from @fontsource/* packages
  images/
    logo/                 Processed logo marks (logo-icon-white.webp, logo-badge-brown.webp) — tracked in git
    favicon/               favicon.ico, apple-touch-icon.png, icon-512.png — tracked in git, derived from the logo
    hero/, content/, gallery/, team/   Optimized site photography (vipsthumbnail output) — NOT tracked in git
images/                        Dev-only source photography — NOT deployed, NOT tracked in git
docs/                          Dev-only briefing docs and source copy text (bios etc.) — NOT deployed, NOT tracked in git
robots.txt, sitemap.xml        SEO baseline
LICENSE-CODE, LICENSE-CONTENT  MIT (code) / CC BY-NC-ND 4.0 (content)
package.json, package-lock.json, shell.nix   Build-only tooling, not deployed
README.md                Human-facing setup/build/deploy instructions
```

## Photography is not version-controlled

Per client instruction (privacy — these are photos of children), **no
photography is committed to git**, only the site logo/favicon. `.gitignore`
excludes `assets/images/*` (with `assets/images/logo/` and
`assets/images/favicon/` explicitly re-allowed) and all of the top-level
`images/` (dev-only source photography). The files still exist on disk in a
normal working copy — this only affects git tracking, not local dev or
deploy.

**Do not `git add` an image under `assets/images/{hero,content,gallery,team}/`
or under `images/`** — if you're adding new photography,
it should land on disk for local preview/deploy but stay untracked. If you
add a new *logo/favicon* variant, that's the one exception and should be
added normally under `assets/images/logo/` or `assets/images/favicon/`.

This repo's git history was deliberately rewritten (`git filter-repo`) on
2026-09-08 to purge previously-committed photography from all past commits,
not just untrack it going forward — commit hashes before that point no
longer match any earlier clone/backup of this repo.

`index.html` sections, in order (anchor IDs): `#home #approach #seasons
#gallery #sessions #fees #team #safety #booking #contact`.

## Stack & why

- **Tailwind CSS v4** via `@tailwindcss/cli`, CSS-first config (`@theme` block
  in `input.css`, no `tailwind.config.js`, no PostCSS). Compiled once to
  a committed `assets/css/site.min.css` — the deployed site does not run
  Tailwind or Node.
- **No framework, no bundler.** `assets/js/main.js` is plain JS (nav toggle +
  accessible lightbox). Anchor smooth-scroll is pure CSS
  (`scroll-behavior: smooth` + `scroll-margin-top` per `section[id]`, with a
  `prefers-reduced-motion` override).
- **Self-hosted fonts**: Fraunces (display/headings) + Work Sans (body),
  vendored from `@fontsource/*` npm packages into `assets/fonts/` as woff2,
  referenced via `@font-face` in `input.css`. No Google Fonts runtime
  call.
- **Images**: optimized one-off via `vipsthumbnail` (resize, re-encode,
  `strip` EXIF — important since these are photos of children on a public
  server). **Always pass absolute input/output paths to `vipsthumbnail`** —
  relative `-o` paths get wrongly joined against the input file's directory.
  For crop-to-aspect on portraits (team photos), use `--size WxH --smartcrop
  attention` (not `--crop`, which vipsthumbnail doesn't recognise as a
  flag and silently mis-parses the next token as a second input file).
- **Logo/favicon**: source is two client-supplied JPEGs on white backgrounds
  (`logo_brown.jpeg` — full-colour art on a tan circular badge;
  `logo_white.jpeg` — same art, no badge). Both get a transparency knockout
  via `imagemagick`: `convert in.jpeg -fuzz 4% -transparent white -trim
  +repage out.png`. The white variant is further cropped to just the
  tree/acorn icon (excludes the baked-in wordmark) for use next to live
  "Acorn to Oak" text (header); the brown variant keeps its full circular
  badge (icon + wordmark) for standalone use (footer, booking section,
  favicon), since a self-contained circle badge doesn't need adjacent text
  and reads fine on any background. Final assets are re-encoded to webp via
  `vipsthumbnail` into `assets/images/logo/`. `favicon.ico` (16/32/48) and
  `icon-512.png` are generated from the brown badge with `imagemagick`,
  keeping transparency; `apple-touch-icon.png` (180×180) is flattened onto
  an opaque `#faf6ec` (cream-100) background per Apple's no-transparency
  convention. There's no vector source, so there's no `favicon.svg` anymore.
- **Nix**: `shell.nix` provides `nodejs` (build-only), `vips`
  (`vipsthumbnail`), `imagemagick` (`convert`, for favicon generation from
  the logo), and `python3` (`python3 -m http.server` for local preview).
  Nothing here ships to the server.

## Critical gotcha: path types matter for deployability

- HTML `src`/`href` attributes must be **relative** (`assets/...`, not
  `/assets/...`) — the site has been deployed to a subdirectory
  (`/acorntooak/`) before, and root-relative paths broke under that.
- CSS `url()` paths in `input.css` resolve relative to **the built output
  file's location** (`assets/css/`), not the source file's own location or
  the HTML page — hence `url("../fonts/...")`, not `url("assets/fonts/...")`
  or an absolute path.
- If you change either, rebuild CSS and grep for stray `="/assets/` or
  `url("/assets/` before committing.

## Build / verify commands

```bash
nix-shell                                    # node, vips, imagemagick
npm install                                  # Tailwind + font packages (dev-only)
npm run build:css                            # or watch:css while editing
python3 -m http.server 8000                  # preview at http://localhost:8000/
```

There is no automated test suite. Verification is manual: load the page,
check nav anchors scroll with correct header offset, open the mobile menu at
narrow width, open/cycle/close the gallery lightbox, confirm images have alt
text, confirm `mailto:`/`tel:` links are correct. Headless Chromium
(`nix-shell -p chromium --run "chromium --headless=new ..."`) has been used
in this session for scripted screenshot QA when a browser isn't otherwise
available — see git history / prior session notes for the CDP-scripting
approach if you need to revive it.

## Deploy payload

Whitelist, not blacklist: only `index.html`, `assets/`, `robots.txt`,
`sitemap.xml`, `LICENSE-CODE`, `LICENSE-CONTENT` are uploaded — see the
`rsync` command in `README.md`. Everything else in the repo (tooling,
source material, docs, briefing files) is dev-only by default and never
deployed unless added to that list — keep this note and that command in
sync if the deploy payload changes.

A temporary hidden demo was previously deployed to
`https://www.preciouschicken.com/acorntooak/` for client review (separate
build with `noindex, nofollow` added, not part of this repo's git history).
That was explicitly temporary/throwaway, not the production deployment.

## Changelog: second client update pass (2026-09-08)

Per `acorn_to_oak_second_prompt.md`, all of the following are now **done**:

- Real domain (`https://www.acorn-to-oak.co.uk`) and email
  (`hello@acorn-to-oak.co.uk`) everywhere they appeared (canonical, OG tags,
  JSON-LD, `robots.txt`, `sitemap.xml`, `mailto:` links).
- Dan & Katy's real profile photos (`assets/images/team/`, cropped 3:4 via
  `vipsthumbnail --smartcrop attention`) and real bio/skills copy in
  `#team`, replacing the placeholder boxes and `TODO` text.
- Client's real logo replaces the hand-drawn inline-SVG acorn mark in the
  header, footer, and booking section, and the favicon set was regenerated
  from it (see "Logo/favicon" above).
- Photography stopped being tracked in git entirely (see "Photography is
  not version-controlled" above), including a full history purge.
- README.md and this file brought up to date.

## Outstanding work

Still genuinely open (not part of the second-prompt brief):
- **Instagram/Facebook icons**: removed entirely from the footer
  (2026-09-08) — the client doesn't have these accounts yet and may never.
  Re-add only if/when real links exist; don't restore `#` placeholders. To
  bring them back, add this inside the footer's Contact `<div>`, after the
  contact `<ul>` (the icons were between the contact list and the closing
  `</div>` at what's now around line 573 of `index.html`):

  ```html
  <div class="mt-4 flex gap-3">
    <a href="#" aria-label="Instagram (coming soon)" class="flex h-9 w-9 items-center justify-center rounded-full border border-cream-200/30 text-cream-200/80 hover:border-cream-50 hover:text-cream-50">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4.5 w-4.5" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
      </svg>
    </a>
    <a href="#" aria-label="Facebook (coming soon)" class="flex h-9 w-9 items-center justify-center rounded-full border border-cream-200/30 text-cream-200/80 hover:border-cream-50 hover:text-cream-50">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4.5 w-4.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
        <path d="M13.5 8.5h1.5V6h-1.7c-1.6 0-2.8 1.2-2.8 2.8V11H9v2.5h1.5V18h2.3v-4.5H15l.3-2.5h-2v-1.4c0-.4.3-.7.7-.7z" fill="currentColor" stroke="none"/>
      </svg>
    </a>
  </div>
  ```

  Swap the `href="#"` for the real profile URLs and drop the "(coming
  soon)" from the `aria-label`s at that point.
- Confirmed safety/insurance/qualifications wording (`#safety` section,
  currently generic placeholder, flagged on-page)
- Live booking system link once procured (currently `mailto:`/`tel:` CTA,
  marked with an HTML comment in `index.html`)
- Deploy to the client's Namecheap host — requires the user's own SSH
  authentication; do not attempt without them present. The exact remote
  path is deliberately not documented in this repo (client instruction).

## Working conventions learned this project

- Ask before running anything that touches the client's live server or
  requires credentials the agent doesn't have — SSH/password-authenticated
  actions must be run by the user themselves, not the agent.
- The user reviews visual changes by reloading the page themselves; don't
  assume a screenshot substitutes for their own look unless asked.
- Footer/legal links have been hand-edited by the user directly (e.g.
  "Get directions" now points to a real Google Maps link, the CC BY-NC-ND
  footer line links straight to the Creative Commons deed) — don't revert
  these without checking.
