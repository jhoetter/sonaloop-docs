# Persona lifecycle & memory

A detailed persona profile is useful, but it is not the same thing as lived memory. Sonaloop keeps
three layers visible:

1. **Profile and SOUL** — identity, context, goals, constraints, relationships and natural voice.
2. **Grounding** — claims linked to independent real evidence.
3. **Memory** — dated synthetic everyday events, facts, unresolved loops, consolidation and period
   digests that existed before the current product stimulus.

Synthetic continuity is not real-user observation. Memory rows retain their source, references,
review state and uncertainty. Current recall omits superseded or archived material; historical
recall also omits anything that did not yet exist at that date.

## Creating a persona

Reuse a suitable catalog persona first. When the catalog lacks the needed context, create a custom
one through the detailed browser flow or through MCP (`brief_persona` → `record_persona`). The UI asks
for everyday context, tools/channels, goals, constraints, recurring friction, success criteria,
working and communication style, risk posture, important relationships and optional observed
evidence. It uses the same validated service as MCP and immediately creates the SOUL.

Creation does **not** invent a life history or silently mark the persona ready. The detail view shows
readiness over profile completeness, grounding, memory volume, continuity and capabilities. A thin
persona stays explicitly thin. The ready label requires a specific profile, independent evidence,
authored capabilities, eight lived events, four consolidated facts, three daily summaries, a
reflection, a period digest, a current green semantic critic and no severe current anomaly. Many
unprocessed events do not count as deep memory.

## Building memory deliberately

An agent starts `begin_persona_build` with a stable operation id. The resumable build returns one
exact next dispatch at a time and can be reopened later. It will:

1. resolve the first profile, evidence or capability gap;
2. plan a realistic period;
3. author and persist sampled mundane days from the loaded SOUL;
4. consolidate durable facts and unresolved loops;
5. create a period digest;
6. evaluate continuity and anomalies with a persisted semantic critic; and
7. re-check readiness.

If no independent source corpus exists, the build stops visibly at grounding. It never creates
supporting material from the product prompt. `persona_build_step`, `get_persona_build` and
`list_persona_builds` make the lifecycle safe across interrupted agent runs.

Product-task language must never be written backwards into pre-project memory. Reaction Tests add a
separate Cohort Integrity gate for independence, leakage and countervoices; readiness does not waive it.

## Ready for this task, reproducible later

Global readiness is not enough for every assignment. `persona_task_readiness` checks whether the
persona has relevant memory or grounding, belongs to the project cohort, and supports the requested
interaction rung. `prepare_persona_for_task` freezes the exact persona version, memory cutoff,
loaded sources, capability requirement, limitations and context hash. A later reviewer can reopen
the immutable snapshot instead of silently asking a newer persona.

## Authentic persona voice

Session comments are immediate first-person thoughts in the language the persona has demonstrated.
Research shorthand such as “findability problem”, “information architecture” or “top task” belongs
in later analyst synthesis unless that person naturally uses it. Observed action/state, persona
thought and researcher interpretation remain separate so a replay answers both “what happened?” and
“what did this person make of it?” without impersonating a UX researcher.

`validate_persona_output` prepares a semantic voice review against the exact persona context.
`record_persona_voice_check` keeps the scores, issues and content hash rather than the raw candidate.
UX jargon is a warning signal, not an automatic verdict: the semantic check still decides whether
the wording is natural for this specific person.

## Conversation memory needs review

Persona chat never learns silently from its own generated replies. Selected turns can become a
pending `record_memory_proposal`, but a reviewer must approve or reject it with a reason. Approved
notes are available only as future chat continuity and are clearly marked as synthetic conversation,
not evidence, lived experience, durable facts or identity change. This prevents self-reinforcing drift.

Memory inspection is also side-effect free: `get_persona_memory` only renders. Writing a file is the
separate, workspace-contained `export_persona_memory` operation. Old episodes are archived
reversibly by pruning rather than silently destroyed.

## Rename and delete

Names and core metadata can be edited from the persona's `…` menu. Delete first previews its exact
impact and requires the display name. It removes profile, SOUL, personal memory/evidence and avatar,
then detaches the persona from active cohorts. Historical councils and recorded sessions remain as
research evidence. A linked active research run blocks deletion. MCP deletion is deliberately
stricter: inspect the impact first, then pass its state-bound confirmation token to the delete call.
Agent edits can first call `preview_persona_update` and then apply against the returned persona
version with a reason. Immutable ids and provenance cannot be patched; identity evolution needs
resolving source references.
