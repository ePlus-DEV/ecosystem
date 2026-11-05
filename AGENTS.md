# AI contributor guide

- This is a static, zero-dependency site targeting Node 22 for scripts and CI; avoid introducing a framework without a clear reason.
- `registry/sites.json` is the only source of publicly published sites. `registry/candidates.json` is untrusted discovery output and must **never** be shown by portal/widget.
- Validate production ownership, HTTPS and relevance before editing the registry. Never publish staging/private or third-party URLs.
- The embedded `widget.js` is a classic script running inside arbitrary host websites. Keep CSS inside Shadow DOM, avoid globals, keep the DOM safe (`textContent`), preserve keyboard functionality and avoid third-party tracking.
- Portal and widget must not force-redirect or change canonical URLs, cookies, consent or GA4 of host sites.
- Run `npm run check` after modifying registry, scripts or site code. Use a PR; do not push directly to main.
- Keep public paths compatible with `https://eplus-dev.github.io/ecosystem/` until an approved custom domain is configured.
- **SEO content freeze:** Never change `<title>`, meta description, canonical, Open Graph title/description/URL, robots directives or other existing SEO text without explicit owner approval. Visual redesigns must preserve this metadata byte-for-byte unless change is explicitly requested.
- UI changes must match the approved reference: white/blue responsive portal, horizontal category pills, compact app cards, mobile single column, matching light widget. Verify viewports 320, 390, 430, 768, 1024, and 1440px; avoid page-wide overflow hacks to hide root causes.
- Do not edit `registry/sites.json` to alter a URL or project description without validation. Vietnamese UI labels (`descriptionVi`, `nameVi`) are display translations, not SEO overrides.
- **Official branding:** Never draw or recreate ePlus glyphs with text/CSS. Use byte-identical colored and white SVG assets from `ePlus-DEV/cdn.eplus.dev` for header, hero, footer, favicon and widget; obtain owner approval before changing artwork.
