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

The call creates or repairs the project and its first run as a retry-safe saga, then returns exactly
one valid next action. For a ready research task this is `run_step`. For a Reaction Test that still
needs setup it is the current evidence or cohort remediation instead; the raw journal may already
exist, but `state="needs_setup"` takes presentation and orchestration precedence. Reuse the exact
same call and key after a timeout, reconnect,
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
connector family. The inspector shows the bounded display label on both the Jobs overview and the Job
detail. It never renders the opaque actor id.

When the first `begin_research_job` request also carries a recognized, server-observed MCP client,
Cloud freezes a separate closed connector snapshot. The UI may then render, for example,
**Created by Ann-Kristin · via Mistral** or **… · via ChatGPT**. The label comes from a fixed
family-to-product mapping, not caller text. Unknown or conflicting connector observations are omitted,
and retries through a different client cannot rewrite the first snapshot. This remains a connector
claim only: the tooltip states that it does not prove the hidden model or inference provider. The
caller-authored `provider` and `model` trace fields never power the byline.

Jobs that predate the field remain explicitly **unknown** during ordinary edits, retries and support
inspection. Sonaloop does not infer their creator from current ownership, project text, connector
metadata, audit timing or the person viewing the workspace, and it does not silently backfill a
plausible name. A privileged Cloud support operation may fill a legacy gap only when a current
workspace owner explicitly attests an exact project-to-current-member mapping. That operation is
dry-run-first, tenant-bound and audit-receipted; ambiguous, missing or conflicting assignments fail
closed. The inspector still renders only the member's bounded display label, never the attestation
receipt or opaque identities.

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

The inspector presents a genuine `needs_setup` gate as **Waiting for input** / **Wartet auf
Eingabe**, with one concrete next action. It is an input request, not an error state. Archived test,
duplicate and superseded Jobs never contribute to the global Run indicator.

### Resumable report hand-off

The final project report is a governed multi-write dispatch, not a side effect of reaching the end of
the plan. `run_step` returns `step_id="__report_handoff__"` with one stable `report_id`, its exact
`dispatch_token` and the remaining section ids. A scaffold and each partial section are progress only.
The host authors each section through `brief_synthesis_section` → `record_synthesis_section` against
that same report/token. Only a non-empty lead plus at least one section with every section authored
links and checkpoints the report.

If the host, connector or provider stops partway through, the next `run_step` returns the same report,
same dispatch and first unfinished section. A partial hand-off does not create another Job or report,
and the completeness critic cannot begin until the hand-off is complete. A capped run also does not
manufacture an empty report.

The same report is resumed only while it remains the correct frozen hand-off. Once the plan has a
current verify synthesis, that exact synthesis must exist in the report snapshot and be named by at
least one section as an input. A fully authored report that predates the terminal synthesis is stale:
it remains immutable and inspectable, but it no longer satisfies project completion. The next governed
scaffold derives one stable refresh intent from the original operation and required synthesis, then
creates one current replacement report. Transport retries converge on that replacement instead of
creating more reports.

Cloud's report-render analytics follows this same content-derived boundary: a legacy report marked
`done` but still carrying an empty section remains `running`/partial and has no ready-age. The stored
status flag alone never upgrades an unfinished report.

That structural hand-off is not a shortcut around research provenance. Project reports use their
native section citations rather than a duplicate generic claim envelope. New outlines freeze their
graph sources when the report is scaffolded. If a structural section has no phase-local nodes, it
receives the graph-wide source ids from that frozen snapshot, so even structural prose has an explicit,
bounded citation set.

For a current section with a non-empty `source_study_ids`, validation requires at least one citation
from that exact section list as its phase anchor. Additional cross-phase citations are allowed, but
every supplied citation must still exist in the report's immutable graph snapshot. An older persisted section whose
`source_study_ids` is empty gets a compatibility fallback, but only to study ids already present in the
frozen graph snapshot's build order or nodes. The empty legacy list never admits a newly added live
project node or an arbitrary external study. Missing or foreign citations keep the report readable but
mark project health unverified. In other words, complete bodies answer “was a report delivered?”,
while valid section citations answer “is its prose evidence-backed?”.

The inspector uses the same provenance to connect the hand-off visibly. Deduplicated section source
ids become `based_on` edges into the terminal report node; for historical source-less sections only,
snapshot-valid citations provide the bounded fallback. It never infers an input from timestamps or
from merely being present in the snapshot. The contributing synthesis is therefore marked as used,
the report is the endpoint, and both the project outline and report detail expose the relationship.
The section-authoring brief resolves typed `council:<id>`, `synthesis:<id>` and `note:<id>` sources to
their real summary, voices, convergence and observation content while preserving those typed ids for
citations and edges. Large source payloads are bounded with an in-band truncation record, so omitted
material cannot silently read as an absent finding. Large outline graphs return an aligned bounded
source/build-order slice plus full totals and a stable digest; edge and open-question omissions are
counted in the same response.

That graph snapshot remains unchanged during an in-place lead repair of an already authored report.
Evidence added to the live project afterward cannot retroactively legitimize an earlier citation; use
a new report outline when the evidence boundary genuinely needs to change. Governed final hand-off
does this automatically when the current terminal synthesis is missing from an older report. Report
sources are validated against the frozen/current graph's build order and nodes, not the legacy project
study-id projection.

## Reaction Test evidence contract

A Reaction Test cannot start from a model's assumptions about the application. Its first governed
step is a versioned **Product Understanding** preflight:

1. attach or capture the real product stimulus (screens, a defined flow, a captured artifact or a
   grounded observed session);
2. inspect it and record target, revision, observed routes/flows/states, explicit unknowns and
   evidence-cited capability claims; and
3. pass the dispatch token so the record is linked and checkpointed through the replay-repairable
   dispatch sequence.

A public URL in the request identifies the target only. It is not a screenshot, a captured route,
an observed state, behaviour evidence, or permission for Sonaloop Cloud to fetch the page. A URL-only
job therefore returns `stimulus_required` and one direct-byte screenshot admission template. If the
host cannot supply real PNG/JPEG/WebP bytes, it asks the user for a screenshot; it must not invent an
inventory from the URL.

After each admitted screen, an exact capture review asks the host to name missing routes/states or
deliberately finalize the inventory. A one-action host therefore cannot freeze its first screenshot
as a complete application by accident. A later screen/revision invalidates the older review and flow
for current setup.

For a finalized remote flow, weak clients do not have to author the nested integrity artifact.
`inspect_reaction_test_screen` delivers one exact screen at a time and writes a dispatch-bound receipt
whose honest status is `served_to_host`; it does not pretend to prove model cognition.
`record_manifest_product_understanding` accepts one flat `{step_index, visible_observation}` per
delivered screen plus explicit `unknown_capabilities`. It refuses missing/mixed receipts. The server
supplies the immutable manifest binding, revision, evidence references and coverage checklist and
reports an exact field plus a safe retry on malformed input. Honest unknowns are valid; the URL can
never manufacture an observed pass.

If the project has no cohort, the next frame dispatch includes bounded workspace-local candidate
summaries (id/name/role/segment) next to `select_reaction_test_cohort`; the model chooses at least two
real IDs instead of guessing them. If too few exist, the sole action is catalog discovery first.
Selection does not claim that Cohort Integrity passed. The normal server-owned depth, leakage and
countervoice gate still runs after the research frame. Each remediation advances the same project
and run under its original operation/dispatch identity.

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
`capped`. Repeating `run_step(run_id)` after any terminal status is a read-only terminal replay: it
returns `kind="done"`, the persisted status and `idempotent_replay=true`, and cannot issue another
dispatch or mutate the plan.

Normal clients should not call `finish_run` to force success. Continue until `run_step` returns
`kind="done"`. The web inspector's run state is derived from these underlying facts, not from a
model's prose claim that it is finished.

## Diagnose and recover without making a duplicate

`project_health(project_id)` is the canonical support view shared by MCP, CLI and the inspector. It
separates **needs setup**, **running**, **stalled**, **expired but resumable**, **engine-finished** and
**output unverified**. An active journal becomes stalled after six quiet hours and is projected as
expired after 24 hours. Expiry is not persisted as a terminal status: the run stays `active`, its
journal is preserved and the same run remains the safe continuation. It never implies unverified
evidence; `unverified` is reserved for an output that fails the evidence or hand-off contract. A
missing current Reaction-Test prerequisite takes precedence over a raw active journal, so Jobs, Job
detail, `/runs` and the global attention indicator cannot claim background research is progressing.
Only the current prerequisite is actionable; later dependent gates remain hidden/locked until their
inputs exist. The normal project
canvas keeps its compact run chip and a human-readable state. Open **Technical diagnostics** in the
chip or in `/runs` when support detail is actually needed: there Sonaloop names the first unmet
invariant, last successful operation, Product Understanding coverage, claim/source counts,
repairable orphaned evidence, one safe next action and a stable `sltrace_*` workflow reference.
Completed Product Understanding/cohort evidence remains inspectable behind one closed, borderless
setup-details row instead of interrupting the Job canvas with engineering cards.

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
competing ids. When setup is incomplete, continuation returns that one current remediation instead
of a misleading `run_step`; otherwise its returned `run_step(run_id)` must be repeated on that same
id until the engine returns `kind="done"`.

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
Similarity of names or prose never chooses a canonical job. Archived jobs leave the normal Jobs
overview, `⌘K`/`Ctrl+K` project results, methodology-related job discovery, the Runs overview,
global run-status widget and `GET /api/runs`, but their exact `/jobs/{project_id}` detail links
continue to resolve with the retained evidence.

## Provider quality versus contract quality

Stronger models still plan, route tools and write better. The **server-side safety invariants** do
not depend on model strength: transaction order, idempotency, executable tool profiles, evidence
links and completion gates are server-enforced. Host routing, orchestration and research quality
remain model-dependent and must be qualified separately. This lets Mistral, OpenAI, Anthropic,
MiniMax and future hosts use the same guarded protocol while their quality differences remain
measurable rather than becoming duplicate jobs or false completion states.

Cloud support can reconstruct the Sonaloop-observed side with
`cloud_get_research_job_trace(project_id=...)` or the stable
`cloud_get_research_job_trace(workflow_trace_id="sltrace_…")`. A W3C/HTTP transport trace identifies
one request; the content-free workflow trace follows one job across creation retries, later MCP
calls, its run, sessions, assets, reports and exports. Legacy projects derive the same value without
a migration. The local replay includes retries, project/run state,
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
