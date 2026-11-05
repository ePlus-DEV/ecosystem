# ePlus Ecosystem

A fast, accessible and **framework-independent** directory for ePlus.DEV products. One curated JSON registry powers both the [ecosystem portal](https://eplus-dev.github.io/ecosystem/) and a shared widget that can be embedded on existing websites. No backend, package install or database is required to serve the portal.

## Features

- Responsive portal with search, category filters, sorting, dark/light theme and accessible keyboard controls.
- Zero-dependency `eplus-ecosystem` Web Component, including **app switcher** and **contextual related apps** modes.
- Registry validation (IDs, category references, HTTPS ePlus domains, duplicate URLs, relation targets and metadata).
- GitHub Actions discovery of public organization repositories via homepages and CNAME files. **Discovery only proposes candidates**; it never silently publishes a new site.
- GitHub Pages deployment, Node 22 CI and built-in `node:test` tests.

## Architecture

```text
registry/sites.json            # Published sites: manually curated source of truth
registry/candidates.json       # Suggested sites: not published
index.html + app.js + styles.css  # Portal, plain JS and CSS
widget.js                     # Single-file embeddable Web Component
scripts/registry-utils.mjs    # Shared data rules
scripts/validate-registry.mjs # Data validation
scripts/discover-sites.mjs    # GitHub metadata + health-check discovery
.github/workflows/           # CI, discovery PRs, Pages deployment
```

## Run locally

Requires Node.js 22+ for tests and discovery. Static web serving works with any server.

```bash
npm run check
python3 -m http.server 8080
# open http://localhost:8080/
```

Do **not** open `index.html` with `file://` because the registry is loaded using `fetch()`.

## Embed on an existing website

Add the following to the page (or shared header). Replace `site` with the published registry ID such as `onair`, `camera`, `free-tier`, `arcade`, `blog` or `top-github`.

```html
<script defer src="https://eplus-dev.github.io/ecosystem/widget.js"></script>
<eplus-ecosystem site="onair" mode="switcher" theme="dark"></eplus-ecosystem>
```

To show contextual cross-links on a content page instead of the header:

```html
<eplus-ecosystem site="camera" mode="related" theme="light"></eplus-ecosystem>
```

Supported attributes:

| Attribute | Purpose |
| --- | --- |
| `site` | Current site ID; used to rank the explicit `related` websites first. |
| `mode` | `switcher` (default) or `related` (up to 3 recommendations). |
| `theme` | `dark`, `light` or `auto` (use system preference). |
| `endpoint` | Optional custom HTTPS location for a compatible `sites.json` file. |
| `portal` | Optional HTTPS URL of the directory, used by the “Explore all” link. |

The widget reads the JSON file relative to the URL of `widget.js` by default, so it works on both custom domains and GitHub Pages subpaths. Configure the host/CDN to return `Access-Control-Allow-Origin: *` for public JSON if embedding across origins. Sites need to install the widget **once**; subsequent registry changes are shared on next page load. No third-party cookies are needed. A failed registry request still shows a link to the portal.

For production, use a **versioned** widget URL and keep breaking changes under a new major version; the MVP currently serves `widget.js` at the root. Avoid modifying a website's own canonical URLs, sitemap, analytics configuration or browser navigation behavior.

## Add a website

1. Confirm it is a publicly accessible production property owned by ePlus.DEV.
2. Add an object to `registry/sites.json` with a unique `id`, `name`, HTTPS `url`, description, category, tags, icon, `featured` and `related` site IDs.
3. Run `npm run check`; open a PR and review the actual destination and relevance of cross-links.
4. Merge to `main` when verified. GitHub Pages updates the portal and central registry automatically if Pages is configured.

Candidates are written only to `registry/candidates.json` by the scheduled workflow. Review candidates and manually promote them into the published registry. A public repo **does not automatically mean** its site is production-ready.

## GitHub configuration

- **Settings → Pages → Build and deployment → Source → GitHub Actions** to publish the site at `https://eplus-dev.github.io/ecosystem/` after merging.
- **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**, if you want the discovery workflow to open PRs automatically. The default `GITHUB_TOKEN` must have write permission for the workflow.
- The discovery workflow runs daily at 03:17 UTC (10:17 ICT) and supports manual `workflow_dispatch`.
- Custom domain (for example `ecosystem.eplus.dev`) is optional; add DNS and update portal canonical/OpenGraph URLs when enabled. Don't add a `CNAME` until DNS and Pages are configured.

## Security, privacy and SEO

- Registry URLs must use HTTPS and stay within `eplus.dev` or its subdomains. External source links should remain ordinary content, not Registry entries.
- DOM output is assembled using `textContent`, not raw untrusted HTML; links open with `rel="noopener noreferrer"`.
- All important site links are also listed in `<noscript>`; each independent site retains its own canonical, metadata and sitemap.
- No analytics SDK or personal-data tracking is included. An optional future opt-in event layer can record aggregate ecosystem referrals without changing each site's existing GA4.

## Maintainers

[ePlus-DEV](https://github.com/ePlus-DEV) · [Report an issue](https://github.com/ePlus-DEV/ecosystem/issues)

## UI design and preview

The portal follows the approved light blue/white ePlus design, including:
- Navigation, responsive hero with connected app orbit, central search, horizontal pill filters, 3/2/1 card grid and mobile menu.
- Featured cards show five highlighted apps plus a discovery card; **Xem tất cả** expands the directory.
- Favorites stay locally on the visitor's device; no authentication or cross-site tracking is added.
- Light mode is the default for the portal, with a high-contrast dark option.
- Vietnamese UI labels come from optional registry fields (`nameVi`, `descriptionVi`, `ecosystemGroup`), and fall back to existing metadata for new sites.
- The `widget.js` switcher and related suggestions use the same visual style and preserve framework independence.

**SEO safety:** The `<title>`, description, canonical and Open Graph metadata on the portal are unchanged during this redesign. See `tests/ui-contract.test.mjs`.

Preview both embed modes at `preview-widget.html` (marked `noindex`).

**Note:** Sites added to the registry must be checked as production deployments before release; the registry is the live publication list, whereas discovery proposals remain unpublished.

## Brand assets

The official ePlus mark in the portal header, hero, footer, favicon and embedded widget is cloned unchanged from [ePlus CDN](https://github.com/ePlus-DEV/cdn.eplus.dev/tree/main/img/brand) at revision `54858b166e3be9062b134e01b8ed6aa8b5e15fac`. `assets/brand/logo.svg` is multicolor and `assets/brand/logo-white.svg` is used on the blue hero tile. Never recreate the logo with CSS/text.

## Satellite website icons

The portal cards and cross-site widget display each website's **real favicon**, instead of the category illustration. Artwork follows this priority:

1. Curated `logoUrl` in `registry/sites.json` (optional, HTTPS on eplus.dev or an ePlus subdomain).
2. Curated `faviconUrl` in the same record (optional, same trusted-domain restriction).
3. Google's cached favicon: `https://www.google.com/s2/favicons?domain=<hostname>&sz=128`.
4. Existing category SVG if the remote image request fails.

Both images are decorative (`alt=""`) because each card's linked website name is already accessible. Icons use `loading="lazy"`, `object-fit:contain`, and no-referrer requests. Google may return an old or generic icon even with HTTP 200; for exact brand identity, publish a reviewed first-party `logoUrl`. The Google fallback involves an external browser request and may be blocked by an embedding website's Content Security Policy. The fallback SVG remains available. This does not change individual websites' actual browser favicon or SEO metadata.
