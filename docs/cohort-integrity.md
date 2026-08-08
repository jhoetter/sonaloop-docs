# Cohort Integrity for Reaction Tests

A synthetic persona can sound convincing while merely repeating the product problem it was just
authored to have. Sonaloop's **Cohort Integrity** gate makes that circularity visible before any
persona reaction can count as research evidence.

This is a server-enforced contract. It works the same way for Mistral, OpenAI, Anthropic and other
MCP hosts; a prompt may explain the workflow, but cannot waive the gate.

## Where it sits in the run

A governed Reaction Test begins in this order:

1. **Product Understanding** inventories the real target, revision, routes, flows, states and
   capability posture from cited assets or sessions.
2. The initial **research frame** commits the actual questions and hypotheses.
3. **Cohort Integrity** evaluates those framed hypotheses and the product stimulus against the
   selected personas.
4. Only a current passing (or explicitly overridden) version lets councils/tests feed the result.

The cohort result is bound to the exact cohort ids, Product Understanding revision and root-frame
question/hypothesis digests, plus the mutable project goal/description. If one changes, the inspector
labels the old result stale and downstream Reaction Test completion fails closed.

## Independent context is not product stimulus

The gate keeps two lanes separate:

| Independent target context | Product stimulus |
| --- | --- |
| Persona facts, experience events and attached evidence dated at or before project creation | Project goal/description, framed questions/hypotheses and current Product Understanding |
| Shows what the persona knew or lived independently | Shows what the current test may have seeded |

For every persona, the result retains the number of facts, events and evidence records, how many
predate the project, post-project counts, source provenance, evidence source types, event date range,
profile creation time and age at project start. Product material is never written into persona
memory just to make this check pass.

## Leakage and representation checks

The deterministic leakage feature contains no product or industry vocabulary. It compares selected
profile claims with each stimulus claim using versioned token coverage, Jaccard overlap and shared
bigrams. The result includes input digests and explainable overlap diagnostics.

A host may add a semantic similarity score, but it must use the server-issued input digest. One
server threshold applies to every provider/model, and lexical checking always remains active.

The cohort also declares why each participant is a `target`, `skeptical`, `indifferent`, or
`non_target` voice. A countervoice only counts when it includes an exact basis quote and a cited
persona-owned fact, event or evidence record dated before project creation whose stored text contains
that quote. Bare host labels remain `unverified` and fail closed. A governed council must include one
grounded countervoice and a statement whose structured non-positive stance matches that declaration.

Independent depth and leakage remain separate signals. Even a deep persona requires reselection (or
an explicit visible override) when its profile strongly overlaps the framed/product stimulus; depth
does not silently turn possible circularity into validation.

## What happens when it fails

The versioned status is one of:

- `pass` — depth, circularity and representation checks pass;
- `needs_deepening` — too much of the cohort lacks independent memory/evidence;
- `needs_reselection` — the cohort is missing/small, lacks a countervoice, or a thin profile strongly
  overlaps the stimulus; or
- `overridden` — a human/host supplied a concrete exceptional rationale.

A failed result is not just advice in prose. Sonaloop records it in the run journal and inserts a real
remediation task into the plan. The host must deepen independent experience/evidence or select a
better cohort, then run a new version. This is why a weaker model can recover through explicit work
instead of silently turning a warning into a finding.

Overrides require a concrete rationale and remain visible as a report limitation in the project,
inspector and exports. An override is useful for an inspectable exception; it does not qualify a
provider or make a circular cohort methodologically strong.

## Inspecting and operating the gate

The project and report pages show a Cohort Integrity card with:

- pass/block/stale state and policy version;
- independent context depth and thin-persona count;
- maximum lexical and optional semantic overlap;
- declared countervoices;
- required remediation tools; and
- any override limitation.

Agents use the MCP gather/write/read sequence:

```text
brief_cohort_preflight(project_id)
record_cohort_preflight(project_id, representation=..., dispatch_token=...)
get_cohort_preflight(project_id)
```

The equivalent CLI commands are `cohort-preflight-brief`, `cohort-preflight-record` and
`cohort-preflight-get`. Reuse the run dispatch token and stable operation identity on transport
retries; do not create a replacement project or frame.

## What the gate does not claim

Depth and non-circularity are necessary, not proof that every synthetic response is accurate.
Stronger models can still reason, moderate and synthesize better. Sonaloop therefore keeps model
quality measurable through the invariant provider-qualification harness while enforcing the same
cohort, evidence and completion contract for every adapter.
