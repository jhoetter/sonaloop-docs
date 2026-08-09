# Reliable job creation and continuation

External MCP hosts can lose a response after Sonaloop has already committed a write. Sonaloop's
job/run contract makes a retry resume the same intent rather than creating another project, run or
journal row.

## Create once, retry safely

When Sonaloop Cloud exposes `begin_research_job`, that is the only project-creation front door for
normal interactive workspace clients. The lower-level `start_project` primitive remains an
operator/hosted-automation compatibility surface, but is deliberately absent from the normal Cloud
tool profile. Call the front door exactly
once per user intent with the user's verbatim request, a stable opaque `operation_id`, and an explicit
methodology choice:

```text
job = begin_research_job(
  user_request=<the user's verbatim request>,
  operation_id="<stable key for this one request>",
  methodology="auto" | "Reaction Test" | "freeform",
  provider="mistral" | "openai" | "anthropic" | ...,
  model="<declared client model, if known>",
)
```

The call creates or repairs the project and its first run as a retry-safe saga, then returns the
single valid `run_step` call. Reuse the exact same call and key after a timeout, reconnect,
permission prompt or client error such as 6101. Never recover by creating a replacement project or
run. If a weak host nevertheless assigns a fresh attempt id, Sonaloop matches the same logical
request inside the bounded `SONALOOP_FRONT_DOOR_RETRY_WINDOW_SECONDS` window (default 30 minutes).
A workspace-bound logical generation is derived before the project write, so simultaneous retries
with different attempt ids also converge through one atomic project claim. The window is anchored
at the first accepted request; later aliases are recorded with their provider/model/session/consent
metadata but do not extend it. Exact operation-id replay remains valid after the window expires.
A genuinely new request gets a new operation key. To run an intentionally separate but otherwise
identical study inside the window, pass `new_job_intent=true` with a fresh operation key; reusing a
previous key fails closed. If several intentional identical studies are still recent, an alias-only
retry is ambiguous and must use its original operation key. Thus four
attempt-scoped retries of one request followed by a distinct second request produce two jobs, not
ten. Project, plan and run are replay-repairable; they are not claimed to be one physical database
transaction.

Raw-content consent on an alias applies to that observed call but does not silently upgrade the
canonical job's persisted consent for later steps. Workspace owner policy and deployment kill
switches remain independently required.

### Authenticated creator attribution

For Cloud jobs created after creator attribution is enabled, the creator is the authenticated user
behind the active workspace membership at the first successful project commit. It is server-derived
provenance: a caller cannot supply or override a creator through `user_request`, provider/model
metadata, MCP `_meta` or an operation key.

The first creator is immutable. An idempotent retry by the same user returns the existing attribution;
a retry or continuation by another authorized workspace member may act on the job but cannot rewrite
who created it. This keeps **created by** distinct from **last acted on by** and from the external MCP
connector family.

Jobs that predate the field remain explicitly **unknown**. Sonaloop does not infer their creator from
current ownership, project text, connector metadata, audit timing or the person viewing the workspace,
and it does not silently backfill a plausible name. UI and support exports must preserve that unknown
state.

`methodology="auto"` is the normal choice when the user has not selected a framework. Sonaloop
ranks routing signals authored on the **live methodology registry**; framework vocabulary is data,
not a hardcoded provider prompt. An explicitly named methodology or Job preset always wins. A
unique automatic candidate must clear its registry-declared threshold and ambiguity margin. If no
candidate clears that bar, or two remain too close, `begin_research_job` returns one short
clarification with `no_mutation=true`. Ask it once and repeat the call with the chosen exact
methodology. It never silently falls back to freeform.

`freeform` remains a valid deliberate choice. Every accepted job persists a
`methodology_decision.v1` trace with the requested/resolved value, source, deterministic routing
confidence, ranked candidates, matched signals, rationale and any explicit override. Confidence is
a routing score, not a calibrated research-quality probability; the governed evidence and critic
gates still decide whether the run is complete.

Hosts without that Cloud tool use the two-step Core contract below.

Use one opaque, non-sensitive key per mutation intent and reuse it only for transport retries of
that same payload:

```text
project = start_project(
  title=...,
  goal=<the user's request>,
  methodology="Reaction Test",
  operation_id="<stable project-create key>",
)

run = start_run(
  project_id=project.id,
  operation_id="<separate stable run-create key>",
)
```

The keys are workspace-scoped. Identical replays return the original object with
`idempotent_replay=true`; conflicting payloads fail without mutation. Do not put prompts, names,
email addresses, API keys or other customer data into an operation key. Once a `run_id` is known,
resume an interrupted run with `start_run(project_id, run_id=...)`.

Methodology keys and display names are resolved before the first write. `Reaction Test`,
`reaction-test` and `reaction_test` all resolve to the durable `reaction_test` key. Unknown or
ambiguous names leave no orphan project.

## Drive the server-owned state machine

Repeatedly call `run_step(run_id)` and execute exactly the returned dispatch. Newer dispatches carry a
`dispatch_token` that binds every mutation to the active project, run and task before the mutation is
written. The persisted claim also freezes workspace, dispatch cursor, expected output kind and a
content-free input fingerprint, and permits one primary output kind. Supported evidence writers
auto-link their output, complete the task when its evidence gate passes, and checkpoint the exact
dispatch. Replaying the same token and authored payload returns the original primitive and receipt.
An authored repair while the gate is still open gets an explicit payload revision; changed content
after completion, another primary output kind, another project or another task fails before mutation.
This closes the common failure window where a weak host writes an artifact and disconnects before it
links or checkpoints it.

Primitive storage, evidence linking and the journal checkpoint are a replay-repairable sequence of
commits, not one physical database transaction. Retrying the same token repairs any interrupted seam
without minting a second primitive. This distinction matters in incident analysis.

Compatibility paths still expose the deterministic `key`/`checkpoint_step` protocol. Follow the
dispatch response rather than inventing a second orchestration path.

## Reaction Test evidence contract

A Reaction Test cannot start from a model's assumptions about the application. Its first governed
step is a versioned **Product Understanding** preflight:

1. attach or capture the real product stimulus (screens, a defined flow, a captured artifact or a
   grounded observed session);
2. inspect it and record target, revision, observed routes/flows/states, explicit unknowns and
   evidence-cited capability claims; and
3. pass the dispatch token so the record is linked and checkpointed through the replay-repairable
   dispatch sequence.

After Product Understanding, the initial frame and the final cohort-integrity gate, Reaction Test
exposes two concrete Council dispatches in order: first-impression/comprehension and
trust/information-gaps/action-readiness. These are methodology data, not prompt folklore. The host
does not call `add_task` or invent its own breadth; both distinct evidence-producing tasks must
complete before the verify/synthesis gate can pass.

Every later council and synthesis carries explicit claim posture:

| Posture | Meaning |
|---|---|
| `observed` | real behaviour backed by a grounded session and exact `step:` anchor |
| `memory_grounded` | supported by citable persona memory/evidence |
| `simulated` | a synthetic persona reaction |
| `inferred` | an evidence-linked analyst inference |
| `unsupported` | not currently supported; blocks a verified Reaction Test artifact |

A screenshot proves a product state, never observed user behaviour. Synthetic councils cannot be
relabeled as observation. Uninventoried prose and unsupported claims remain visible as an
unverified hypothesis draft instead of silently becoming findings.

After Product Understanding, the initial research frame commits the questions/hypotheses and a
final [Cohort Integrity](cohort-integrity.md) preflight checks them against independent pre-project
persona depth/provenance. Thin circular profiles require real deepening/reselection work and a
declared countervoice. Cohort ids, Product Understanding revision and frame-hypothesis digests bind
the pass together with project goal/description; changing any of them makes it stale. Countervoices
must quote cited independent pre-project persona context rather than exist as bare host labels, and
deep memory does not waive high stimulus/profile overlap. An explicit override remains a report limitation.

For a `critic` dispatch:

1. call `record_completeness_critic(project_id, verdict, run_id, operation_id=dispatch.operation_id)`;
2. call `record_critic_round(run_id, critic_report_id=report.id, key=dispatch.key)`; and
3. continue with `run_step`.

Those links are mandatory. Retrying one verdict cannot count as two independent critic rounds.

## What “finished” means

Only the engine owns successful completion. A run can become `finished` only when its plan/result
contract is complete, required organization/conclusion/handoff artifacts exist, and two distinct,
persisted, run-bound completeness critics pass with no missing work. Read failures are unknown
evidence and therefore fail closed. The only terminal status values are `finished`, `stopped` and
`capped`.

Normal clients should not call `finish_run` to force success. Continue until `run_step` returns
`kind="done"`. The web inspector's run state is derived from these underlying facts, not from a
model's prose claim that it is finished.

## Diagnose and recover without making a duplicate

`project_health(project_id)` is the canonical support view shared by MCP, CLI and the inspector. It
separates **running**, **stalled**, **engine-finished** and **output unverified**. The normal project
canvas keeps its compact run chip and a human-readable state. Open **Technical diagnostics** in the
chip or in `/runs` when support detail is actually needed: there Sonaloop names the first unmet
invariant, last successful operation, Product Understanding coverage, claim/source counts,
repairable orphaned evidence, one safe next action and a redacted `sltrace_*` support reference.

In Sonaloop Cloud, a user can simply ask their MCP host to continue an existing job. With an exact
project id the host calls `continue_research_job` directly. Without one it first calls
`list_unfinished_research_jobs(query=...)`: one match is selected; several matches must be shown to
the user for an explicit choice. Titles are never guessed or silently merged.

`continue_research_job(project_id=...)` follows an explicit state table. It resumes the sole active
run; starts one deterministic governed run when the job never started or its previous run was
stopped/capped; and starts a separate repair run only when an engine-finished job has unverified
output plus concrete ready plan work. One legacy exception is deliberately fail-closed: if an old
front-door project has an operation id but no persisted run budget, continuation asks the host to
retry the **original** `begin_research_job` call with exactly the same arguments instead of guessing
that budget. It never creates a project, replaces an active run, or continues an
archived/superseded or clean terminal job. Multiple active legacy runs fail closed and name the
competing ids. Its returned `run_step(run_id)` must be repeated on that same id until the engine
returns `kind="done"`.

Core/local clients can use the lower-level equivalent returned by `project_health`: call
`resume_project_run(project_id, run_id, operation_id?)`, then `run_step(run_id)`. Resume checks the
explicit project/run identity and never creates a replacement, reopens a terminal run or marks it
finished.

Run creation also has a hard single-active-owner invariant per workspace and project. Concurrent or
accidental second starts fail with the existing run id and an exact resume instruction. Legacy stores
that already contain multiple active rows remain inspectable, but recovery fails closed until an
operator explicitly reconciles them instead of guessing.
Run creation, deletion, archiving and superseding also share one project-scoped cross-process
lifecycle lock: a close/delete operation cannot race a new active journal onto an archived,
superseded or vanished project. A project with an active run must be explicitly stopped or recovered
before it is preserved as closed. Hard delete is limited to never-started containers without any run
history; once a governed journal exists, archive the job and retain its evidence.

The support view is honest about blind spots: it cannot prove that an external MCP host disconnected
and cannot see hidden provider prompts, reasoning, permission dialogs or host-internal retries.
Cloud can join its tenant-bound audit replay through the returned project/run/operation query.

The inspector distinguishes a job whose run never started, an active run that went quiet, and a job
whose previous run stopped or hit its cap. All three need attention. A quiet active run resumes its
existing journal; a stopped/capped job starts one deterministic successor run; and a never-started
job normally starts its one missing governed run (subject to the legacy missing-budget exception
above). The global counter therefore says that jobs need attention instead of pretending every row
is a currently stalled worker. Attention takes display priority over an unrelated active-run count,
so one progressing job cannot mask eight that need intervention.

Duplicate cleanup preserves history. `supersede_project(new_id, old_id, operation_id, reason)` records
an explicit old→new relationship and marks the old job obsolete without deleting any artifact.
`archive_project(project_id, operation_id, reason)` is also non-destructive and refuses active runs.
Similarity of names or prose never chooses a canonical job.

## Provider quality versus contract quality

Stronger models still plan, route tools and write better. The **server-side safety invariants** do
not depend on model strength: transaction order, idempotency, executable tool profiles, evidence
links and completion gates are server-enforced. Host routing, orchestration and research quality
remain model-dependent and must be qualified separately. This lets Mistral, OpenAI, Anthropic,
MiniMax and future hosts use the same guarded protocol while their quality differences remain
measurable rather than becoming duplicate jobs or false completion states.

Cloud support can reconstruct the Sonaloop-observed side with
`cloud_get_research_job_trace(project_id=...)`. The local replay includes retries, project/run state,
the front door's caller-supplied `user_request`, release metadata and deterministic quality scores. The
request stays workspace-owned domain data; metadata-only audit/PostHog projections retain only
privacy-reduced summaries. Replay labels unprovable facts `unknown`; it never
pretends to contain an external host's hidden prompt, reasoning, provider retry or model response.

### Live provider qualification is a separate gate

`qualification-run` replays captured submissions through the deterministic harness. It proves the
Sonaloop contract, not that a live Mistral/OpenAI/Anthropic host chose the right tool from natural
language. A provider canary must use an isolated workspace and an ephemeral private MCP connector,
then separately assert routing safety (same project, one governed run, idempotent repetition) and
research completion/quality. A programmatic connector test still does not exercise Le Chat's own
permission and retry UI, so that surface needs a small manual smoke as well. Provider credentials
belong on the canary/operator side; they are not required in the Sonaloop production service merely
to test an external host.
