# Cloud execution audit and PostHog observability

Sonaloop Cloud records Remote-MCP execution in a tenant-bound local audit
ledger and can project a privacy-reduced view into PostHog. The local record is
the authority: PostHog is an operational view for traces, product analytics,
dashboards and alerts, not the source of truth for replay.

There are two execution planes:

| Plane | What Cloud observes | PostHog events |
|---|---|---|
| External MCP host (for example Claude, Mistral or ChatGPT) | Authenticated request transport phases and calls that cross Sonaloop's MCP tool boundary | One `sonaloop_mcp_request_phase` per durable lifecycle phase, plus one `$mcp_tool_call` and one `$ai_span` per durable tool audit row |
| Cloud-hosted agent | Every provider wire attempt and the internal tools Cloud executes | One `$ai_generation` per attempt under one run trace, with child `$ai_span` tool operations |

PostHog documents the tool and AI event contracts in [MCP
Analytics](https://posthog.com/docs/mcp-analytics/start-here) and [AI
Observability](https://posthog.com/docs/ai-observability/start-here);
`sonaloop_mcp_request_phase` is Sonaloop's custom transport event. Sonaloop uses
its own exporter because the Remote-MCP route has a custom stateless session
manager. Adding PostHog's native beta MCP wrapper as a second path would give it
the wrong transport ownership and double-count tool calls.

## The authoritative local ledgers

Every Remote-MCP `tools/call` produces an append-only row in
`cloud_mcp_execution_audit` and its delivery receipt in one database transaction. Each row is bound to exactly one workspace and
contains the correlation and outcome needed to investigate the tool boundary:

- audit, request, trace and operation ids;
- tool name, MCP profile, status, error code and duration;
- project and run ids when the call produced or referenced them;
- client, server and protocol version metadata; and
- bounded, recursively redacted argument/result summaries and their digests.

Authorization headers, cookies and secret-shaped fields never enter the row.
The default policy replaces arbitrary strings with type, length and SHA-256
digest metadata. Local content capture is a separate, explicit decision:

In addition, every authenticated Remote-MCP request gets a unique lifecycle in
`cloud_mcp_transport_lifecycle`. The table is append-only, protected by the
same workspace-scoped Postgres row-level security as the tool ledger, and uses
deterministic phase identities so duplicate transport notifications cannot be
counted twice. A lifecycle can contain the following phases:

| Phase | What it proves |
|---|---|
| `received` | Authentication, live workspace membership and MCP profile checks succeeded, and Cloud entered the observed request boundary. Requests rejected before that boundary are not lifecycle rows. |
| `body_read` | ASGI delivered the complete HTTP request body to Cloud. Only byte and chunk counts are retained; the lifecycle ledger never stores the body. |
| `rpc_parsed` | The MCP SDK parsed one JSON-RPC message. Cloud records only bounded structural metadata such as method, tool name and safe correlation ids. |
| `tool_started` | The SDK dispatched one tool invocation into Sonaloop's tool manager. |
| `tool_completed` / `tool_failed` | That invocation returned successfully, returned a technical error result, or raised. |
| `receipt_committed` | The corresponding `cloud_mcp_execution_audit` row and this phase were committed atomically. It proves the local audit receipt, not delivery to or rendering by the external host. |
| `response_started` | Cloud handed the HTTP response status and headers to the ASGI server. |
| `responded` | Cloud successfully handed the final response-body message to the ASGI server. This is **not** a TCP/client acknowledgement and does not prove that Le Chat, Claude or another host displayed the result. |
| `client_disconnected` | ASGI reported that the client disconnected. |
| `transport_error` | The receive, handler or send path failed before Cloud could prove a normal terminal hand-off. |

Cancellation and a handler that returns without any other terminal signal are
retained as the explicit exceptional terminals `request_cancelled` and
`request_aborted`. Tool and parsed-message phases have invocation-specific
phase keys, so a batched request remains reconstructable without overwriting
earlier phases.

The request-body receive pump stays active while the MCP SDK handles the
request. It therefore detects an `http.disconnect` that arrives after
`body_read`—the important case where a host uploaded a complete tool call and
then gave up while the tool was executing or the response was being prepared.
This narrows the server-visible causes of a host error such as Le Chat 6101; a
failure inside the host before it sends HTTP remains unobservable. Phases are
buffered per request and committed in a small number of transactions over a
bounded PostgreSQL pool. Completion plus `receipt_committed` stay atomic, while
abandonable three-second deadlines prevent an unavailable audit database from
holding the connector response indefinitely. Audit DB calls use a dedicated
four-worker limiter, so abandoned diagnostics cannot consume the worker budget
used by synchronous customer tools.
As with every audit write, lifecycle persistence is fail-soft: an audit outage
cannot replace the customer's tool result. A missing phase remains a visible
local replay gap rather than being inferred later.

```bash
SONALOOP_MCP_AUDIT_ENABLED=1
SONALOOP_MCP_AUDIT_RETENTION_DAYS=30
SONALOOP_MCP_AUDIT_CAPTURE_CONTENT=0
SONALOOP_MCP_AUDIT_MAX_STRING_CHARS=512
SONALOOP_MCP_AUDIT_EXPORT_WORKER=1
SONALOOP_MCP_AUDIT_EXPORT_INTERVAL_SECONDS=2
SONALOOP_MCP_AUDIT_EXPORT_BATCH_SIZE=25
SONALOOP_MCP_AUDIT_EXPORT_LEASE_SECONDS=60
SONALOOP_MCP_AUDIT_EXPORT_MAX_ATTEMPTS=10
SONALOOP_MCP_AUDIT_EXPORT_BACKOFF_SECONDS=2
SONALOOP_MCP_AUDIT_EXPORT_BACKOFF_MAX_SECONDS=3600
```

`SONALOOP_MCP_AUDIT_RETENTION_DAYS=0` disables global metadata/legacy pruning.
It does **not** make approved content indefinite: every content receipt freezes
the workspace's 14–30 day retention and expires on that schedule. Export is fail-soft: a PostHog outage or
bad exporter configuration cannot replace, repeat or fail a successful MCP
tool call. The request path commits only the local ledger and outbox receipt; it performs no
PostHog network I/O. A lifespan-managed worker later claims receipts through a bounded Postgres
lease, exports them, flushes the SDK, and marks them delivered. Crashed leases are reclaimed;
failures use bounded exponential backoff and become explicit dead letters after the configured
attempt limit. The worker continues across tenant failures and every claim remains protected by
Postgres row-level security.
If ledger persistence itself fails, Cloud logs a structured fallback error but
still preserves the customer tool result; treat that log as an observability
gap and alert on it.

!!! important

    "Authority" does not mean that metadata-only rows contain a hidden copy of
    prompts or tool content. They are the authoritative record of what Cloud
    observed under the configured policy. Exact content reconstruction is
    possible only where that content was lawfully captured elsewhere, such as
    the Cloud-hosted agent journal.

## Configure PostHog capture

PostHog export is off by default. For an EU project, configure the capture path
from the deployment's secret/configuration store:

```bash
SONALOOP_MCP_AUDIT_EXPORTERS=sonaloop_cloud.posthog_exporter:exporter
POSTHOG_PROJECT_API_KEY=<PostHog project API key>
POSTHOG_HOST=https://eu.i.posthog.com
SONALOOP_TELEMETRY_HMAC_KEY=<independent key of at least 32 bytes>
SONALOOP_TELEMETRY_HMAC_KEY_VERSION=v1

# Keep both off for the metadata-only default.
SONALOOP_POSTHOG_CAPTURE_CONTENT=0
SONALOOP_POSTHOG_HOSTED_ENABLED=0
SONALOOP_LLM_TRACE_CAPTURE_CONTENT=0
```

Do not commit literal values or paste them into support messages. Keep
`SONALOOP_TELEMETRY_HMAC_KEY` independent from `SONALOOP_CLOUD_SECRET` and
stable across deploys. Rotating it deliberately breaks correlation between
historical and new workspace/session pseudonyms.

Generate an independent key without reusing an application or provider secret:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

The version is an identity epoch. Each durable receipt freezes its version. Before rotation, pause
new export work and drain all pending receipts, then change both key and version together. If an old
receipt meets a newer configured version, the exporter fails closed and leaves it undelivered rather
than creating a second identity/UUID for the same operation. Repair the configuration or perform an
explicit migration and requeue; never silently retry it under the new epoch.

`POSTHOG_PROJECT_API_KEY` is the `phc_…` project key used to ingest events. It
is the only PostHog credential needed by the running capture path.
`POSTHOG_HOST` is an ingestion endpoint, not the PostHog UI or query API host.

The following settings are optional and are **not** used to send events:

| Variable | Use |
|---|---|
| `POSTHOG_PERSONAL_API_KEY` | Operator-only API readback; never use it as the project API key |
| `POSTHOG_PROJECT_ID` | Project selected by an automated readback check |
| `POSTHOG_API_HOST` | Query/API origin, normally `https://eu.posthog.com` for EU Cloud |

Prefer keeping readback credentials in a separate restricted verification job
rather than the capture process. Interactive verification in the PostHog UI
does not require these environment variables.

## Event model and correlation

One Remote-MCP ledger row has two deliberate projections:

- `$mcp_tool_call` powers MCP usage, error and latency analysis. It carries the
  tool name, duration, error state and the Sonaloop audit correlation.
- `$ai_span` places the same observed tool boundary in an AI trace. It carries
  the shared trace id, an audit-derived span id, latency and input/output state
  at the configured privacy level.

The pair shares `sonaloop_audit_event_id` and `$ai_trace_id`; it is one observed
operation in two PostHog surfaces, not two tool executions. Dashboards that
count tool executions should use `$mcp_tool_call` only.

Each durable request-lifecycle row has one separate, content-free projection:

- `sonaloop_mcp_request_phase` carries the closed phase/status, elapsed request
  time, bounded body byte/chunk counts where applicable, HTTP status, tool/method
  labels and HMAC-scoped correlation ids.
- Method labels come from a closed MCP vocabulary and tool labels must match the
  server's actual tool registry. A client-controlled unknown value is omitted;
  it cannot become a plaintext channel into the ledger or PostHog.
- It does not claim to be an LLM generation or an additional tool execution.
  Count distinct `sonaloop_transport_lifecycle_id` values for requests; counting
  these phase events directly counts transitions, not requests.
- The event is emitted through the same durable outbox worker as the existing
  `$mcp_tool_call` and `$ai_span` events. PostHog delivery can therefore be
  replayed without replaying the customer operation.

### Declared MCP connector identity

During MCP `initialize`, Cloud reduces `params.clientInfo.name` to a closed,
low-cardinality connector family such as `mistral`, `claude`, `chatgpt`,
`codex`, `cursor` or `unknown`. It binds a recognized family to the current
workspace bearer until that bearer's expiry, capped at 90 days, so later tool
requests can carry the same family even when their HTTP user agent is generic.
The binding key is a domain-separated workspace/token HMAC.

Raw bearer tokens and raw `clientInfo` name/version values are never stored or
exported. The local binding retains only lengths and protected fingerprints;
PostHog receives the closed family and its classification source. A user-agent
family is only a fallback, and an unrecognized or ambiguous declaration remains
`unknown`.

The local bearer binding is keyed with `SONALOOP_CLOUD_SECRET`; exported
workspace/request/lifecycle identities remain keyed independently with
`SONALOOP_TELEMETRY_HMAC_KEY`. Do not substitute either key for the other.

This identity describes the **MCP connector host**, not the inference model or
provider. For example, a declaration matching Le Chat can truthfully produce
connector family `mistral`; it does not prove which Mistral model handled the
conversation, whether the host retried a provider call, or even that every
request under that connector used the same model.

Audit schema v3 adds one privacy-reviewed semantic result contract. A technically
successful `record_cohort_preflight` can expose `sonaloop_outcome` as exactly one
of `pass`, `needs_deepening`, `needs_reselection`, `overridden`, or the fixed
fallback `unknown`. The exporter revalidates the tool, technical status and exact
contract version before adding the property to both projections. It never exports
an arbitrary result `status`, rationale or malformed version string. This is
low-cardinality structural metadata, does not authorize content capture and is
absent on legacy receipts.

Technical failures stay separate from semantic outcomes. `$mcp_error_type` and
the paired `$ai_error.code` use PostHog's closed categories (`missing_context`,
`validation`, `permission`, `timeout`, `rate_limited`, `api_4xx`, `api_5xx`, or
`internal`); raw local exception codes remain in the tenant ledger.

PostHog's trace and session layers have separate meanings:

- `$ai_trace_id` groups one interaction's spans. A valid inbound W3C trace is
  preserved; otherwise Cloud creates a request trace. Every observed toolcall has
  a unique `$ai_span_id`, and its parent is retained when W3C context exists.
- `$ai_session_id` groups the request traces belonging to one governed run, then
  falls back to project/session/operation correlation when no run is known.
- MCP Analytics `$session_id` represents explicit MCP session metadata, with a
  request-local fallback. `$mcp_conversation_id` carries the governed run/project
  grouping. Domain objects that happen to be named `session_id` are not treated as
  protocol sessions.

Cloud returns a normal single-call response `traceparent` containing the
resulting tool span, so a capable host can continue the tree on its next request.
When a tool legitimately adopts an MCP `_meta.traceparent` in the absence of an
HTTP trace, its completion span can differ from the inbound request-lifecycle
trace. Both event families carry the same HMAC-scoped
`sonaloop_transport_lifecycle_id`, which is the exact join in that case.
If a future transport batches several toolcalls into one response, it returns the
request-local server span instead of choosing an arbitrary child. HTTP trace context takes
precedence over MCP `_meta`; an invalid-but-present HTTP `traceparent` starts a new
trace instead of trusting a second source. Raw `tracestate` values are neither
persisted nor returned; only bounded validity/count metadata enters the ledger.
All exported trace/span identifiers are workspace-HMAC scoped. Sonaloop spans can
therefore nest without exposing raw ids, but separately ingested raw OpenTelemetry
spans do not automatically join this privacy-scoped tree.

At the wire boundary, Sonaloop converts the ledger's ISO timestamp into the
timezone-aware `datetime` required by PostHog's Python SDK. MCP session ids use
the canonical `ses_<32-hex>` form. The credentialed smoke test must query both
reserved event types back; an HTTP `200` from ingestion alone is not the release
gate.

For a Cloud-hosted agent, set:

```bash
SONALOOP_POSTHOG_HOSTED_ENABLED=1
```

The common hosted provider runner emits a distinct observed `$ai_generation` for
every provider wire attempt. Retries share the logical turn and stable run trace but retain their own
attempt ordinal, latency, status, retryability, HTTP status, token usage, error classification and
pseudonymized client/provider request and response ids. The successful attempt becomes the parent
of any internal `$ai_span` tool calls it requested. This keeps a transient 429 followed by success
visible instead of flattening it into one misleading generation. The hosted-agent journal remains
the complete replay authority even if PostHog is unavailable.

Generation attempts and internal tool spans do not call PostHog on the agent
thread. Each becomes an immutable row in
`cloud_hosted_telemetry_projection` plus an idempotent receipt in the same
workspace/RLS-bound outbox used by Remote-MCP audit export. The shared worker
uses `FOR UPDATE SKIP LOCKED`, expiring leases, bounded exponential backoff and
dead letters. A stable, tenant-HMAC-bound PostHog event UUID makes replay after
a capture/flush failure or worker crash idempotent. The event is acknowledged
only after the SDK flush succeeds; until then it remains pending locally.
The exact privacy-frozen projection seed is committed inside the authoritative
provider-attempt/tool-result journal row before enqueue. At every worker tick,
Sonaloop reconciles journal seeds missing their projection/outbox row. Thus a
crash between those two local commits is repaired from the journal rather than
from PostHog.

PostHog's event relationships are described in its [generation
contract](https://posthog.com/docs/ai-observability/generations) and [span
contract](https://posthog.com/docs/ai-observability/spans).

## Identity and privacy boundary

No raw workspace, MCP session, request, operation, project or run id is sent in
the corresponding PostHog correlation fields. Sonaloop derives deterministic HMAC pseudonyms with
`SONALOOP_TELEMETRY_HMAC_KEY`. Locally generated content digests are
HMAC-protected again before export so that low-entropy values cannot be guessed
from an external SHA-256 digest. Person-profile processing is disabled for
these events; the external identity is a workspace pseudonym, not an
individual account.

Content has independent consent gates:

| Data | Default | Required to retain/export bounded redacted content |
|---|---|---|
| Remote-MCP local arguments and results | Metadata/digests | `SONALOOP_MCP_AUDIT_CAPTURE_CONTENT=1` **and** persisted owner-approved `mcp_content_capture` purpose **and** explicit call/persisted-job consent |
| Remote-MCP content exported to PostHog | Metadata/digests | All local gates, `SONALOOP_POSTHOG_CAPTURE_CONTENT=1`, and the receipt's frozen `posthog_content_export` purpose approval |
| Cloud-hosted prompts, outputs, tool arguments and tool results in PostHog | Metadata/digests | Both content env switches and the event's frozen workspace approvals for `posthog_content_export` plus `hosted_generation_tool_content` |

Environment variables are deployment kill switches, never customer consent, and
a host-supplied Boolean is only the narrow call/job signal. The durable authority
is `workspace_telemetry_policy.v1`: an append-only owner-approved revision with
three exact purposes, separate allowed state, purpose, approver/timestamp and
14–30 day retention. Owners set it with the admin-only
`cloud_set_workspace_telemetry_policy`; members can inspect the safe, subject-redacted
state with `cloud_get_workspace_telemetry_policy`. Trusted operators have matching
`sonaloop-cloud workspace-telemetry-policy-set` and
`workspace-telemetry-policy` commands.

The setter is a complete, idempotent replacement: all three purposes must be
present so an omitted field can never inherit an old approval. For example:

```bash
sonaloop-cloud workspace-telemetry-policy-set <workspace-id> '{
  "mcp_content_capture": {
    "allowed": true,
    "purpose": "Reproduce explicitly approved support incidents",
    "retention_days": 14
  },
  "posthog_content_export": {
    "allowed": false,
    "purpose": "",
    "retention_days": 14
  },
  "hosted_generation_tool_content": {
    "allowed": false,
    "purpose": "",
    "retention_days": 14
  }
}' --approved-by '<operator-subject-or-change-id>'
```

Remote MCP does not accept `--approved-by`: the server always records the live
owner subject and ignores any caller attempt to choose the approver.

Each audit receipt freezes a privacy-reduced policy snapshot. The exporter validates
that snapshot and fails closed; therefore an old/legacy event cannot acquire content
just because a workspace opts in later. Revocation applies immediately to new receipts.
An already-created receipt retains its lawful event-time snapshot until its frozen
retention expires. Enabling local ledger content never authorizes external export.
All content modes remain bounded and recursively redact authorization data, cookies,
credentials and secret-shaped fields.

Hosted projection receipts follow the same rule and additionally retain a
separate metadata-only property set. If either content deployment switch is
disabled while a content-bearing receipt is pending, delivery automatically
downgrades to that frozen metadata projection. A malformed or legacy snapshot
is metadata-only. Later workspace enablement never upgrades an older event;
revocation affects newly created events while already collected events keep
their event-time decision until their 14–30 day frozen retention expires.
Expiry removes the pending receipt and replaces the local projection payload
with a content-free event-UUID tombstone. That minimal idempotency marker keeps
the longer-lived authoritative journal from accidentally recreating expired
telemetry content during reconciliation.

PostHog's AI Observability storage is deliberately not the durable replay
archive. PostHog documents that large AI properties such as prompts and
responses are removed after 30 days while trimmed event metadata remains. See
[AI data retention](https://posthog.com/docs/ai-observability/data-retention).
Choose the local ledger/journal retention independently, record the workspace
consent for any content capture, and make support tooling explain which source
still retains which fields. A longer local retention must never be inferred
from PostHog's policy or enabled merely because remote content has expired.

## External-host limitation

When a customer connects Sonaloop to an external Claude, Mistral, ChatGPT or
other MCP host, that host owns inference. Cloud cannot see the host's original
conversation, system prompt, hidden reasoning, model output, provider retries or
model-token accounting. A front-door call may explicitly supply a `user_request` for
Sonaloop to store, but that proves only what the caller submitted—not equality with an
unobservable Mistral/Le Chat transcript. Sonaloop otherwise records only the MCP calls the host sends.

W3C `traceparent`, `x-request-id`, `x-sonaloop-operation-id` and
`idempotency-key` headers improve correlation when the host supports them;
equivalent operation/session metadata can travel in MCP `_meta`. Cloud
generates safe correlation ids when none are supplied. Calls without propagated
W3C context remain separate interaction traces but are grouped by the governed
run's AI session and MCP conversation. This makes the Sonaloop
portion of a job inspectable, but it does not invent an unobserved
`$ai_generation`. Full external-host replay requires tracing in that host and a
shared correlation contract. Cloud-owned agent runs can provide the full
observed generation tree because Sonaloop owns that provider call.

`cloud_get_research_job_trace` reconstructs the local, workspace-confined timeline without
depending on PostHog. It reports attempt ordinals, duplicate suppression, methodology, run/critic
state, evidence health, release commit and audit delivery health. For jobs created through the
retry-safe front door it also returns the workspace-owned verbatim initial request from project state;
“verbatim” here means the exact `user_request` supplied to Sonaloop, not an independently observed
copy of the provider chat. That text is not smuggled into metadata-only PostHog events. Any property outside the observed
boundary is explicitly `unknown`, not inferred from an incomplete trace.

Every replay also carries `coverage`: `local_ledger` is `complete` or
`audit_gap`, content is `complete`, `redacted` or `audit_gap`, and an external
MCP host is always `external_boundary_only`. The overall state becomes
`audit_gap` when receipts are incomplete; otherwise it remains
`external_boundary_only` because a complete Sonaloop ledger still cannot prove
hidden host generations. Support must not present a metadata-only or truncated
replay as a full conversation transcript.

For new attempts, `local_ledger_granularity=request_lifecycle_v1` and the
`audit_complete` score verifies the immutable lifecycle rather than assuming a
tool receipt means the response arrived. The assessment requires `received` and
an observed transport terminal; after `body_read`, it requires either an
`rpc_parsed` receipt or an explicit protocol error. Every `tool_started` must
have a matching `tool_completed`/`tool_failed` and `receipt_committed`. A parsed
tool call that never reaches the dispatch seam is surfaced as a gap, as is a
truncated lifecycle page.

The replay exposes `response_handed_to_asgi` and deliberately reports
`client_ack_observed=false`. A passed lifecycle therefore means that Sonaloop's
locally observable boundary is internally complete; it never upgrades the
overall external-host coverage to a full replay. Legacy attempts without
lifecycle rows retain `completion_receipts_only` granularity and an `unknown`
transport assessment. These limitations are immutable facts of the captured
boundary, not fields that PostHog can fill in later.
If a project spans pre- and post-rollout traffic, replay reports
`mixed_request_lifecycle_and_completion_receipts` and remains `unknown`; one new
complete request never retroactively certifies its legacy attempts.

## Metadata-only smoke test

Use a non-production test workspace first. The test needs no content capture
and no personal API key.

1. Put the project API key and independent HMAC key in the deployment's secret
   store. Set the EU ingestion host and exporter target shown above. Leave all
   content flags at `0`, then restart Cloud. A workspace telemetry policy is not
   needed for this metadata-only smoke; its secure default is revision 0/all denied.
2. Establish a fresh authorized MCP connection so it sends `initialize`, then
   call a harmless read tool such as `list_personas` in exactly one known
   workspace. If the client supports custom headers, give the tool request a
   non-sensitive unique `x-request-id`; otherwise retain the `x-request-id`
   returned by Cloud.
3. Verify the local tool row, request lifecycle and outbox receipts first, using
   an operator connection and both the exact workspace id and request id as
   filters:

    ```sql
    SELECT id, workspace_id, request_id, trace_id, tool_name, status
    FROM cloud_mcp_execution_audit
    WHERE workspace_id = '<workspace-id>'
      AND request_id = '<request-id>';

    SELECT lifecycle_id, phase, status, tool_name, created_at
    FROM cloud_mcp_transport_lifecycle
    WHERE workspace_id = '<workspace-id>'
      AND request_id = '<request-id>'
    ORDER BY created_at, id;
    ```

    Confirm the lifecycle has the expected `received` → `body_read` →
    `rpc_parsed` → tool → `receipt_committed` → response path, or an honest
    disconnect/error terminal. Confirm corresponding `mcp_audit` and
    `mcp_transport` outbox rows progress from `pending`/`delivering` to
    `delivered`. A response-time dependency on PostHog is a release blocker.

4. In PostHog's live events/activity view, find the corresponding
   `sonaloop_mcp_request_phase` events. Confirm their
   `sonaloop_transport_lifecycle_id` is stable within the request, phase ids are
   distinct, `sonaloop_capture_level=metadata`, and the final phase agrees with
   the local lifecycle. Do not interpret `responded` as a client acknowledgement.
5. Find one `$mcp_tool_call` with the matching
   `sonaloop_transport_lifecycle_id`. Request, operation, project and run ids are HMAC
   pseudonyms externally and therefore intentionally do not equal the local
   values. Confirm a corresponding `$ai_span` has the
   same `sonaloop_audit_event_id` and `$ai_trace_id`. Lifecycle and tool trace ids
   also match unless the tool adopted a distinct MCP `_meta.traceparent`.
6. If the client declared a recognized `initialize.clientInfo`, confirm later
   request phases and tool events carry the expected closed
   `$mcp_client_name`. Verify the raw bearer and raw client name/version are
   absent locally and in PostHog. Treat the family as connector identity, not
   proof of the model or provider.
7. Make two harmless calls tied to the same governed run without an inbound
   `traceparent`. Confirm they have different `$ai_trace_id` values but the same
   `$ai_session_id` on `$ai_span` and the same `$mcp_conversation_id` on
   `$mcp_tool_call`. Then propagate the first response `traceparent` and confirm
   the next span joins that trace with the expected `$ai_parent_id`.
8. For a cohort-preflight canary, confirm both tool projections expose the same closed
   `sonaloop_outcome`; verify that no rationale/result text is present.
9. Confirm every MCP event has `sonaloop_capture_level=metadata`, that its
   distinct/session identities are HMAC pseudonyms, and that no raw prompt,
   workspace id, credentials or argument/result text appears.
10. Only if Cloud-hosted tracing is part of the rollout, enable
   `SONALOOP_POSTHOG_HOSTED_ENABLED=1` and run a harmless canary automation.
   First verify a row in `cloud_hosted_telemetry_projection` and a
   `event_kind='hosted_posthog'` outbox receipt progress to `delivered`.
   Verify one `$ai_generation` per provider attempt plus any tool `$ai_span` children under the
   same trace. Keep hosted content capture at `0` for this test.

For automated readback, run steps 4–10 from a restricted operator job using the
optional personal key, project id and API host. Never return the personal key
in logs, test output or a browser response.

## Operations and rollback

- Alert on `$mcp_tool_call` error rate and latency; use `$ai_generation` for
  hosted provider latency, token and error analysis.
- Alert separately on `sonaloop_mcp_request_phase` values
  `client_disconnected` and `transport_error`, and on started tools without a
  terminal/receipt pair. A disconnect after `tool_completed` and
  `receipt_committed` but before `responded` means Sonaloop completed and
  recorded the call while the connector abandoned the HTTP exchange; it does
  not identify the connector's internal error code or retry policy.
- Diagnose missing PostHog events from the local execution and transport
  ledgers first. Exporter errors
  are logged, while the customer operation remains successful. Inspect pending, delivering and
  dead-letter counts per workspace; after remediation, requeue only the selected dead receipts.
- For hosted traces, compare the durable agent journal with
  `cloud_hosted_telemetry_projection`. A journal row without a projection row is
  a local journal-to-outbox gap that the next worker reconciliation must repair;
  PostHog is never the recovery source.
- Disable remote export by clearing `SONALOOP_MCP_AUDIT_EXPORTERS`. This leaves
  the tenant-bound local audit enabled.
- Disable only hosted generation export with
  `SONALOOP_POSTHOG_HOSTED_ENABLED=0`. Hosted receipts remain pending and are
  not claimed or charged retry attempts until the switch is re-enabled.
- The managed worker stops and joins during normal Cloud shutdown. Use a graceful rollout so a
  claimed lease is either delivered or safely reclaimed.
- Apply PostHog access and retention rules separately from the local ledger's
  retention. Removing a local row does not delete an already exported event.
