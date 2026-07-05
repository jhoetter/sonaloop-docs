# Result schemas

Result schemas are Sonaloop's output contracts. They define what must exist before a research job
can be considered done.

They sit beside the existing model:

- **Job**: what the user wants answered.
- **Framework / methodology**: the process used to get there.
- **Format**: one concrete research move inside that process.
- **Result schema**: the neutral shape of the final or intermediate output.

The source in the core repo is
[`sonaloop/result_schemas.json`](https://github.com/jhoetter/sonaloop-research/blob/main/sonaloop/result_schemas.json).

## Domain-neutral by design

Schemas should not encode business domains. A pricing job uses
`ordered_ladder_sensitivity.v1`, not `price_sensitivity`. A blog or messaging pre-launch check uses
`stimulus_reaction.v1` and optionally `threshold_gate.v1`, not `blog_sentiment`.

Domain vocabulary belongs in the Job contract, the user prompt, artifacts, labels and thresholds.
The schema names the reusable result shape.

## Many-to-many

The relationship between methodologies and result schemas is many-to-many:

- one methodology can produce several result schemas;
- the same schema can be reused by many methodologies.

For example, Reaction Test usually produces `stimulus_reaction.v1` and optionally
`threshold_gate.v1`. Double Diamond usually produces `opportunity_map.v1`,
`concept_validation.v1` and `study_handoff.v1`.

Do not create one methodology per schema. Methodologies are process shapes; schemas are output
contracts.

## Evidence policy and interruptions

Each schema carries an evidence policy:

- `synthetic_ok`: persona-grounded evidence can complete the result.
- `live_optional`: synthetic evidence can proceed, but the result should expose the live-evidence gap.
- `live_required`: the job should pause until real inputs exist, such as imported survey responses
  or observed sessions.

This is the first explicit interruption seam for jobs that demand live input.

## Current schemas

| Schema id | Use |
| --- | --- |
| `stimulus_reaction.v1` | Reactions to a fixed stimulus, with sentiment/comprehension/themes. |
| `ordered_ladder_sensitivity.v1` | Reactions across ordered levels, with acceptable range and cliff. |
| `option_comparison.v1` | Comparison among alternatives, with winner, margin and segment splits. |
| `threshold_gate.v1` | Pass/fail/needs-review decision from a metric threshold. |
| `funnel_friction.v1` | Step-level behavior, drop-off and blockers. |
| `change_forces.v1` | Push, pull, anxiety and habit around change. |
| `opportunity_map.v1` | Clustered opportunities under a target outcome. |
| `concept_validation.v1` | Tested concept/prototype fit, risks and next action. |
| `study_handoff.v1` | Presentation-grade answer, evidence trail and exportable deliverable. |

## Inspection tools

CLI:

```bash
sonaloop result-schema-list
sonaloop result-schema-get stimulus_reaction.v1
sonaloop result-contracts
sonaloop result-contract-job content_reaction
sonaloop result-contract-methodology reaction_test
```

MCP exposes the same read surface for agents.
