# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static landing page for eÚčtenka (a Czech point-of-sale app with EET 2.0 support), served at https://euctenka.cz. The site is one hand-written file, `public/index.html`, plus favicon files, `robots.txt` and `sitemap.xml` next to it. There is no build step, package manifest, linter, or test suite: what is in `public/` is what gets served.

## Commands

Requires `firebase-tools` (`npm install -g firebase-tools`, then `firebase login`).

```sh
firebase emulators:start --only hosting   # local preview at http://localhost:5000
firebase deploy --only hosting:landing    # manual deploy to the live site
```

## Deployment

- Push to `main` deploys live via `.github/workflows/deploy.yml`. There is no staging step in between.
- Pull requests get a preview channel URL (expires after 7 days) posted as a PR comment. Fork PRs are skipped because they cannot read the secret.
- Changes so far have all landed as squash-merged pull requests, which is what gives each one a preview before it goes live.
- CI authenticates with the `FIREBASE_SERVICE_ACCOUNT_EUCTENKA` repository secret.

The site is the `euctenka-landing` Hosting site inside the `euctenka` Firebase project. The same project serves the product's web portal at `euctenka.firebaseapp.com`. `.firebaserc` maps the deploy target `landing` to `euctenka-landing`, and both `firebase.json` and the workflow deploy through that target. Keep it that way: a hosting deploy without the target goes to the project's default site, which is the portal.

## Hosting behaviour (`firebase.json`)

- `cleanUrls` is on and `trailingSlash` is off, so `public/foo.html` is served at `/foo`.
- HTML is cached for 5 minutes. Files matching `png|jpg|jpeg|webp|svg|ico|woff2|css|js` are served with `max-age=31536000, immutable`. This already applies to `favicon.ico`, `favicon.svg` and `apple-touch-icon.png`: replacing one in place does not reach returning visitors, so change its URL (new filename or a query string) in the `<link>` tag as well. The same goes for any asset split out into its own file later.
- Dotfiles under `public/` are not deployed.
- `/doporucena-zarizeni` redirects to `/`. It was a page of the previous site on this domain and still has old links pointing at it. Remove the redirect if a real page takes that address.

## Search engines

- The same files are also reachable at `euctenka-landing.web.app`, `euctenka-landing.firebaseapp.com` and the pull request preview URLs. `<link rel="canonical">` in `index.html` is what tells search engines that `https://euctenka.cz/` is the one to index, so every page needs its own canonical tag with the full `https://euctenka.cz/…` address.
- `public/sitemap.xml` lists the pages to index and `public/robots.txt` points at it. A new page needs adding to the sitemap.
- The JSON-LD block in the head of `index.html` describes the site, the company and the app for search engines. It repeats facts from the page (see **Content** below) and must not state anything the visible page does not. The Google Play rating is left out on purpose: Google does not accept ratings copied from another site.

## `public/index.html`

Everything except the favicons is inline: one `<style>` block in the head, the markup, and one `<script>` block at the end of the body. Icons are inline SVG. The only third-party requests are Google Fonts on load and YouTube after a click.

**Reading the file.** It is about 410 KB because the video poster is a base64 PNG inlined in the `style` attribute of the `#video-player` link, on a single line of about 375 KB. A full `Read` fails on size, and any grep or diff that touches that line prints the whole blob. Read with `offset`/`limit` on either side of that line, and truncate output (for example `cut -c1-200 public/index.html | grep -n …`, or `git diff … | cut -c1-400`). Apart from that one line the file is about 600 lines of ordinary HTML, CSS and JS.

**Theming.** Colours, fonts and the corner radius are CSS custom properties on `:root`. The dark palette is written out twice: under `@media (prefers-color-scheme: dark)` for `:root:not([data-theme="light"])`, and again for `:root[data-theme="dark"]`. Change both copies together. `--paper` and `--paper-ink` (the receipt) keep light paper colours in the dark palette.

**Sticky header offsets.** `html` has `scroll-padding-top: calc(69px + safe-area inset)`, which is the nav's 68px height plus its 1px border, so the two change together. Sections that drop their top padding with an inline `style="padding-top:0"` are listed in a `scroll-margin-top: 32px` rule (`#cena, #stahnout, #dotazy, #podpora`) so menu jumps do not land flush under the header. A new section of that kind needs adding to the rule.

**Script.** Three IIFEs:

- EET countdown: fills `#days` with the days left until 2027-01-01, using Czech plural forms (`dní` / `dny` / `den`). The number in the markup is only a no-JS fallback. Once the date has passed, the script rewrites the trailing text through `el.parentNode.lastChild`, so `.deadline` must stay `<b id="days">` followed by exactly one text node.
- Click-to-play video: swaps the `#video-player` link for a `youtube-nocookie.com` iframe built from its `data-yt` attribute, so nothing from YouTube loads before the click. When the page is itself shown inside a frame, the click is left alone and the link opens YouTube in a new tab.
- Contact details: see below.

**Contact details are obfuscated on purpose.** The support e-mail and phone number never appear in plain form in the source, to keep them away from address harvesters. `#mail` holds the two halves of the address reversed in `data-u` and `data-d`, `#tel` holds the nine-digit number reversed in `data-p`, and the script turns them into `mailto:` and `tel:+420…` links in the browser. The element text is the no-JS fallback. To change either one, store the new value reversed. Do not write the plain address or number anywhere in the page (markup, meta tags, structured data).

**Content.** Copy is Czech (`lang="cs"`). Keep new text in Czech and keep the existing `&nbsp;` joins. Several facts are repeated and need updating in every place:

- page title: `<title>` and `og:title`
- page description: `meta name="description"` and `og:description`
- store links: hero, `#stahnout` and JSON-LD (`installUrl`)
- portal link: nav, feature grid, footer
- price: hero lead, `#cena` and JSON-LD (`offers`)
- company name and address: footer and JSON-LD (`Organization`)
- Facebook link: footer and JSON-LD (`sameAs`)
- EET 2.0 dates: hero badge, `#eet` section, and the countdown script (target date plus its own replacement text)

Nav, footer and button links are in-page anchors to section ids (`#funkce`, `#eet`, `#cena`, `#stahnout`, `#dotazy`, `#podpora`), so renaming an id means updating those links and the `scroll-margin-top` rule.
