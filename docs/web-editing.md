# Web editing — the inspector's write boundary

The web inspector started strictly read-only. It now carries a **structural write path**:
metadata and container operations are editable in the browser, while every piece of authored
or generated text stays host-authored (the HOST-AUTHORS-ALL-TEXT invariant). The rule in one
line: **structure yes, generated text never.**

## The mutation boundary

| Entity | Create | Edit | Delete | Notes |
| --- | --- | --- | --- | --- |
| Project | ✅ web (`/projects/new`) | ✅ title/goal/description | ✅ typed-confirmation (type the project title) | container metadata only; the graph/plan stays agent-driven |
| Persona | ❌ MCP-only for authored profiles (`brief_persona` → `record_persona`); ✅ catalog import from `/personas/catalog` via `catalog_pull` | ✅ metadata: name, role title, segment, industry | ✅ typed-confirmation (type the display name) | catalog import is a selective pull from sonaloop-data, not browser authoring |
| Note | ✅ web | ✅ title/text | ✅ | notes are *user/host-authored observations* — typing one in the browser **is** authoring |
| Section | ✅ web | ✅ title/kind/note | ✅ (member nodes untouched) | a section is a view; membership editing stays MCP |
| Council | ❌ | ❌ | ✅ delete only | statements are generated prose — never editable |
| Synthesis / report | ❌ | ❌ | ✅ delete only | report prose is authored/generated — never editable |
| Prototype | ❌ | ❌ | ✅ delete only | recorded artifacts |
| Memories, SOUL, evidence, council content, calendar days | ❌ | ❌ | ❌ | host-authored / generated — MCP/CLI only |

Everything in the ✅ columns goes through the **same service layer** the MCP tools use, so
lifecycle events, hooks, the live event stream and cloud access guards all keep firing
regardless of which surface made the change.

The browser-side catalog affordance searches the curated sonaloop-data catalog and imports a
selected slug through `catalog_pull`. With a local `sonaloop-data` checkout, the page uses the
same facet rules and avatar files as the catalog UI. Free personas import directly. Premium
personas remain visible but require `SONALOOP_CATALOG_TOKEN` (or a hosted request-scoped token);
without it the service returns an in-band `skipped_premium` explanation instead of failing.

## Why persona create is MCP-only

`record_persona` (the only create path) requires the complete host-authored profile JSON
produced by the `brief_persona` protocol — goals, pain points, personality, relationships,
success criteria — authored by the agent against the briefing instructions and validated
server-side. There is no meaningful "structural shell" subset, and a web form asking a human
to hand-type the full profile would bypass the briefing protocol that keeps personas
evidence-shaped. The web therefore offers **metadata edit + delete** only for authored
personas; catalog personas can be imported because the complete authored profile already
exists in sonaloop-data and is pulled verbatim.

## Safety properties

- Every form is **CSRF-protected** (stateless double-submit cookie) and follows
  POST → 303 See Other, so a browser refresh never re-submits.
- Destructive actions live in one consistent **danger zone**; projects and personas require
  typing the entity's name to confirm (re-checked server-side).
- The **cloud guard seam** runs on every browser write (`web.create_project`,
  `web.delete_council`, …), so multi-tenant deployments can enforce role rules with one
  registration. Locally the guard list is empty and every call passes.

The deep technical notes (form pattern, CSRF design rationale, service functions) live in
the core repo: [`docs/web-mutations.md`](https://github.com/jhoetter/sonaloop/blob/main/docs/web-mutations.md).
