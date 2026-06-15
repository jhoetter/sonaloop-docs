# Example projects

Complete, polished demo studies ship inside the Sonaloop wheel and can be loaded into any
database on demand — the fastest way to see what a finished study looks like before running
your own.

| Slug | Study | What's inside |
|------|-------|----------------|
| `onboarding-showcase` | **Onboarding showcase — TeamPulse rollout** | A tour-ready sample project that intentionally includes open questions, council references, a report, survey, flow, integrated prototype, external prototype reference, sessions, hypothesis, decision, notes and assets. |
| `positioning-council` | **Positioning council — Schichtwerk shift planning** | B2B positioning: a buying-coalition panel, a red-team pass on the obvious pitch, an HMW reframe with ranked ideas, and the message that survives. |
| `premium-pricing-study` | **Premium pricing study — Klar money coaching** | B2C pricing: a five-voice panel, a willingness-to-pay ladder, a €19 vs €49 head-to-head, and the decision they add up to. |

Each example is a full project graph: personas, councils (including a price ladder /
head-to-head / red-team / ideation run where relevant), hypotheses, a synthesis,
decisions, notes and sections. The onboarding showcase also covers the inspector's
Library primitives end to end.

## Loading

Three equivalent ways:

- **MCP** — `list_examples` shows what ships (and whether it's loaded); `load_example(slug)`
  loads one and returns the project id + inspector URL.
- **CLI** — `sonaloop load-example` with no slug lists what's available;
  `sonaloop load-example <slug>` loads it; `--all` loads every example.
- **Web** — on an empty database the inspector's home page shows a **Load example** button
  per example (one click, lands on the populated project page).

Loading replays the fixture through the real `record_*` service layer — validated shapes,
server-side aggregates, lifecycle events — so an example project behaves exactly like a real
one (live activity fires, the report renders, exports work).

## Idempotent, and removable without fear

- **Re-loading never duplicates**: every entity uses a stable, example-namespaced id, so a
  second `load_example` is an upsert.
- **`remove_example(slug)`** (CLI: `sonaloop remove-example`) deletes exactly the example's
  entities and nothing else — ids are re-derived from the shipped fixture, and personas are
  matched by their `provenance.example` stamp, so user-created data is never touched.
