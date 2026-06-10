# sonaloop-docs

**The canonical documentation for Sonaloop** — published at
<https://jhoetter.github.io/sonaloop-docs/> so people *and agents* can read it without
installing anything. The machine-friendly index is
[`docs/llms.txt`](docs/llms.txt) (served at `/llms.txt` on the site).

## Why a separate repo

Docs used to live only inside the core repo (`sonaloop/docs/*.md`) and the in-app docs hub
(localhost-only). Agents and prospects couldn't find them. This repo is the single source of
truth; the other surfaces point here.

## Sync rule (canonical direction)

- **This repo is canonical.** New or changed documentation lands here first.
- The core repo keeps deep technical notes only where they are inseparable from the code;
  anything product-facing belongs here, and core's `docs/` files should link here rather
  than grow parallel copies.
- The in-app docs hub (`sonaloop/web/_docs*.py`) is an offline snapshot of the user-facing
  subset; when it diverges, this repo wins.

## Local preview

```bash
pip install mkdocs-material
mkdocs serve   # http://127.0.0.1:8000
```

Deployment is automatic on push to `main` via GitHub Pages (`.github/workflows/deploy.yml`).
