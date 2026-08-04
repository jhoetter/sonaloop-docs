# Sonaloop documentation

**Sonaloop is an MCP server for customer-persona simulation, councils, and design-research synthesis.**

It models customer profiles as persistent agents — durable `SOUL.md` files, timestamped
calendars, activity logs, inner thoughts, evidence, and council-style debates. The **host
agent authors all text**; Sonaloop gathers context, validates, and persists. There are no
server-side text-LLM calls, and simulation is non-directional: profiles are never nudged
toward a product thesis unless their own evidence supports it.

This site is the **canonical documentation** for the Sonaloop product family. It is published
from the [`sonaloop-docs`](https://github.com/jhoetter/sonaloop-docs) repository so that
people *and agents* can read it at a stable URL — no install, no localhost required. A
machine-friendly index lives at [`/llms.txt`](llms.txt).

## Start here

- [Getting started](getting-started.md) — the one-sentence install and your first project.
- [Example projects](examples.md) — complete demo studies, one-click in the local inspector or loadable via MCP/CLI.
- [Job → Framework → Format](job-framework-format.md) — the three-layer taxonomy the whole product aligns on, including the A/B test, pricing and ideation run protocols.
- [Frameworks](frameworks.md) — the methodologies a run can follow.

## Concepts & method

- [Grounding](grounding.md) — evidence grounding and provenance.
- [Artifact inventory](artifact-inventory.md) — references vs assets vs flows vs sessions.
- [Calibration](calibration.md) — prediction calibration and Brier scoring.
- [Opt-in aggregation](opt-in-aggregation-design.md) — the sentiment/coverage aggregation model.

## The inspector

- [The live inspector](live-inspector.md) — the event stream, the activity feed, and the runs panel.
- [Web editing](web-editing.md) — what the browser can and deliberately cannot edit.
- [Keyboard, palette & tour](keyboard.md) — shortcuts, the ⌘K palette, and the local opt-in tour.
- [Feedback](feedback.md) — the built-in feedback channel and its webhook.

## Operating Sonaloop

- [Cloud workspaces and customer access](cloud-workspaces.md) — tenant isolation, managed login, invitations and no-charge workspaces.
- [Embeddings](embeddings.md) — semantic memory recall setup.
- [Persona catalog & pagination](catalog.md) — catalog search/recommend/pull and the list-pagination convention.
- [Lifecycle hooks](lifecycle-hooks.md) — events and subscriptions (the seam cloud automation builds on).
- [Substrate](substrate.md) — the queryable backend substrate for extensions.
- [Project assets](project-assets.md) — attaching asset evidence.

## Live actuation & safety

- [Flow walkthrough](flow-walkthrough.md) — live walkthrough mechanics.
- [Live walkthrough safety](live-walkthrough-safety.md) — safety constraints for live actuation.
- [Selective live actuation](selective-live-actuation.md) — live prototype testing.

## Where things live

| Repo | What it is |
|------|------------|
| [sonaloop](https://github.com/jhoetter/sonaloop-research) | The open core — MCP server, CLI, web inspector |
| [sonaloop-docs](https://github.com/jhoetter/sonaloop-docs) | This documentation (canonical source) |
| [sonaloop-data](https://github.com/jhoetter/sonaloop-data) | The persona database — a CRON-refreshed catalog |
| [sonaloop-design](https://github.com/jhoetter/sonaloop-design) | Brand, design tokens and icons |
