# Persona catalog & pagination

The curated, CRON-refreshed persona catalog lives in
[sonaloop-data](https://github.com/jhoetter/sonaloop-data). Core ships three MCP tools to
browse it, get an explainable cohort recommendation, and pull personas into your database —
**with or without** the `sonaloop-data` package installed.

The web inspector exposes the same selective pull at `/personas/catalog`: search, review
free/premium tier labels, filter with the catalog facet rules, see avatar images, then add one
persona with a POST-backed `catalog_pull`. This is a catalog import, not browser-side persona
authoring.

## `catalog_search`

Browse the catalog: slugs, names, roles, plus a facet summary over the filtered set.

- `query` — free-text filter.
- `facets` — `{facet: [values]}`, e.g. `{"lebensphase": ["schichtarbeit"]}`. Facet filtering
  needs the `sonaloop-data` package with a local catalog, except for manifest-backed
  `tier` (`free` / `premium`), which also works against the remote manifest. Other remote
  facet filters are ignored with an in-band `notes` entry.
- Paginated per the shared convention below: `limit` (default 25) + opaque `cursor`.
- **Remote fallback**: without the package, the search reads the published manifest on
  GitHub at git `ref` (default `main`) — no install required.

## `catalog_recommend`

Deterministic, explainable persona-**set** recommendation — no LLM involved:

```json
{ "keywords": ["pricing", "b2c"], "facets": {"segment": ["..."]},
  "n": 5, "seed_pack": "...", "min_coverage": 2 }
```

Returns ranked picks with human-readable rationales, the set's facet coverage, gap warnings
and a ready pull list. Needs the `sonaloop-data` package with a local catalog (a checkout, or
`SONALOOP_DATA_CATALOG_ROOT` pointing at one); otherwise it answers in-band with an install
note instead of failing.

## `catalog_pull`

Pull catalog personas (by `persona_slugs` and/or an archetype `pack`) into the **current**
store — profiles, SOUL/MEMORY, lived memories, avatars — with `provenance.catalog` stamped on
each persona. Re-pulls are idempotent (stable ids, upserts). Uses `sonaloop-data` when
installed; without it, a built-in stdlib fallback pulls from the published catalog directly.
`embed=true` re-derives embedding vectors when an embeddings provider is configured.

Premium personas are visible in search but gated at pull time. Set `SONALOOP_CATALOG_TOKEN`
to send the bearer token; without it, free personas still land and premium selections are
returned in-band as `skipped_premium`.

## The pagination convention

One rule set for every Sonaloop surface that lists things:

**Machine surfaces (MCP)** — `limit` (default 25) + an **opaque cursor** over a stable sort
key; the response is the shared envelope:

```json
{ "items": [...], "total": 311, "has_more": true, "next_cursor": "…" }
```

- `next_cursor` is present exactly when `has_more` is true.
- The cursor fingerprints the filter set it was issued under — reusing it with different
  filters is rejected (restart from page 1).
- Backward compatible: no params → the first page + the `has_more` hint.
- Adopters: `list_personas`, `list_councils`, `list_notes`, `catalog_search`. (The substrate
  `query_*` tools keep their own versioned `limit`/`offset` contract — see
  [Substrate](substrate.md).)

**Web lists** — numbered pages: `?page=N` lives in the URL alongside the `?q=` filter, so
views are shareable and back/forward restores them. A changed filter resets to page 1; the
heading count and "Page N of M" are computed over the full filtered set (~25 rows per page).
Adopters: `/personas`, `/projects`.
