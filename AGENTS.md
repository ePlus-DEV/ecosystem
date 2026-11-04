# AI contributor guide

- This is a static, zero-dependency site targeting Node 22 for scripts and CI; avoid introducing a framework without a clear reason.
- `registry/sites.json` is the only source of publicly published sites. `registry/candidates.json` is untrusted discovery output and must **never** be shown by portal/widget.
- Validate production ownership, HTTPS and relevance before editing the registry. Never publish staging/private or third-party URLs.
- The embedded `widget.js` is a classic script running inside arbitrary host websites. Keep CSS inside Shadow DOM, avoid globals, keep the DOM safe (`textContent`), preserve keyboard functionality and avoid third-party tracking.
- Portal and widget must not force-redirect or change canonical URLs, cookies, consent or GA4 of host sites.
- Run `npm run check` after modifying registry, scripts or site code. Use a PR; do not push directly to main.
- Keep public paths compatible with `https://eplus-dev.github.io/ecosystem/` until an approved custom domain is configured.
