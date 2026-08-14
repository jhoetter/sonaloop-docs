# Web editing — the inspector's write boundary

The web inspector started strictly read-only. It now carries a **structural write path**:
metadata and container operations are editable in the browser, while generated research claims
stay host-authored. A guided custom-persona intake is the deliberate exception: a human supplies
concrete source facts and the normal persona service validates the resulting profile and SOUL.

## The mutation boundary

| Entity | Create | Edit | Delete | Notes |
| --- | --- | --- | --- | --- |
| Project | ❌ create in UI (MCP/CLI owns creation) | ✅ title/goal/icon; title-only rename in the Jobs list | ✅ typed-confirmation (type the project title) | the list-row `…` menu sits beside Favorite; never-started containers hard-delete, terminal run history is removed from the working set through evidence-preserving archive; active runs remain protected |
| Persona | ✅ detailed custom intake; ✅ catalog import; ✅ MCP/CLI | ✅ metadata: name, role title, segment, industry | ✅ typed-confirmation with impact preview | creation makes a profile and SOUL; readiness keeps missing lived memory visible |
| Note | ✅ web | ✅ title/text | ✅ | notes are *user/host-authored observations* — typing one in the browser **is** authoring |
| Section | ✅ web | ✅ title/kind/note | ✅ (member nodes untouched) | a section is a view; membership editing stays MCP |
| Council | ❌ | ❌ | ✅ delete only | statements are generated prose — never editable |
| Synthesis / report | ❌ | ❌ | ✅ delete only | report prose is authored/generated — never editable |
| Prototype | ❌ | ❌ | ✅ delete only | recorded artifacts |
| Memories, SOUL, evidence, council content, calendar days | ❌ | ❌ | ❌ | host-authored / generated — MCP/CLI only |

Everything in the ✅ columns goes through the **same service layer** the MCP tools use, so
lifecycle events, hooks, the live event stream and cloud access guards all keep firing
regardless of which surface made the change.

The Jobs overview uses separator-free rows. Each remains one ordinary deep link, with Favorite
and a quiet `…` menu as sibling controls on the right. That menu contains only **Rename** (a
title-only dialog) and **Delete job** (the same typed confirmation as the detail page). It does not
introduce checkboxes or imply a bulk-selection mode. If a governed journal exists, deletion means
removing the job from the current working set while preserving its exact audit/evidence deep link.

Project/Job icons are structural metadata. MCP/CLI callers can pass
`icon=<existing name>|"random"` while creating/starting a study, inspect the existing catalogue
with `available_project_icons`, replace an icon with `set_project_icon`, or create a saved,
sanitized custom SVG via `generate_project_icon`. Custom SVGs are written under
`data/project-icons/…`. In the browser, clicking the project header icon opens the same
edit dialog directly at the visual icon picker; the picker only selects from the existing
icon catalogue.

The browser-side catalog affordance searches the curated sonaloop-data catalog and imports a
selected slug through `catalog_pull`. With a local `sonaloop-data` checkout, the page uses the
same facet rules and avatar files as the catalog UI. Free personas import directly. Premium
personas remain visible but require `SONALOOP_CATALOG_TOKEN` (or a hosted request-scoped token);
without it the service returns an in-band `skipped_premium` explanation instead of failing.

## Custom personas, readiness and deletion

`/personas/new` asks for work/life context, tools, goals, constraints, recurring friction,
success criteria, working and communication style, risk posture, relationships and optional
observed evidence. It calls the same `record_persona` service as MCP. The detail view then shows
a structural readiness score over profile, grounding, memory, continuity and capabilities.
A strong profile can therefore remain visibly thin until independent evidence and ordinary,
consolidated days have built real continuity. See [Persona creation & memory](persona-memory.md).

Deleting a persona first shows the impact: personal profile/SOUL/memory is removed and active
project cohorts are detached, while historical councils and recorded sessions remain as research
evidence. MCP uses the same boundary as a two-step, state-bound confirmation token.

## Safety properties

- Every form is **CSRF-protected** (stateless double-submit cookie) and follows
  POST → 303 See Other, so a browser refresh never re-submits.
- Destructive actions live in one consistent **danger zone**; projects and personas require
  typing the entity's name to confirm (re-checked server-side).
- The **cloud guard seam** runs on every browser write (`web.create_project`,
  `web.delete_council`, …), so multi-tenant deployments can enforce role rules with one
  registration. Locally the guard list is empty and every call passes.

The deep technical notes (form pattern, CSRF design rationale, service functions) live in
the core repo: [`docs/web-mutations.md`](https://github.com/jhoetter/sonaloop-research/blob/main/docs/web-mutations.md).
