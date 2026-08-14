# Product telemetry

Sonaloop records privacy-minimal product events through a provider-neutral telemetry
service. The app describes what happened; it does not know where the event is exported.
Sonaloop Cloud currently uses PostHog, but the product functions do not import its SDK or
depend on its event API.

## What is covered

Successful authenticated detail views cover jobs, personas, councils, sessions,
prototypes, surveys and report/synthesis artifacts. Full-page, SPA and drawer renders of
the same item collapse within five minutes. This makes questions such as “did the creator
return to the job after its run finished?” answerable without treating browser mechanics as
separate visits.

Core also records successful, semantically important changes:

- job create, update and eligible delete;
- persona create, update and delete;
- council, synthesis and usability/prototype-session recording;
- survey save/response import and prototype registration/delete;
- asset attach/remove, note changes and section changes; and
- governed run start and finish.

Adoption edges around the newer workflows are included without their content: custom/catalog
persona creation starts; persona views carry only readiness and memory-depth buckets plus evidence
presence; report exports carry format, audience and default/workspace branding/master sources;
design publishing and safe asset uploads carry structural kinds; and prototype registration records
whether workspace branding was inherited. Persona prose, report text, filenames and images are never
telemetry properties.

Command-palette search records a query-length bucket and result count. The search term is
never an analytics property.

These are delivery and completion receipts, not mind-reading. `job_viewed` proves that the
server delivered the authenticated job page. It does not prove that a person read or
understood it. Session evidence remains the source for observed use.

## Questions the contract can answer

The event contract is expressed as vendor-independent sequences:

| Product question | Events and properties |
| --- | --- |
| Did a creator return after a run finished? | `run_finished` → `job_viewed` for one pseudonymous project, with `viewer_is_job_creator=true`. |
| Where does a job activate? | `job_created` → `run_started` → `session_recorded` or `council_recorded` → `run_finished`. |
| Are outputs inspected? | A detail-view event such as `session_viewed` or `artifact_viewed` after its corresponding record event. |
| Do searches help? | `search_used` by surface, input-length bucket and result count, followed by a detail view. |
| Are sessions grounded? | `session_recorded` grouped by `grounded`, `visual_trace` and fidelity. |
| Which cohort sizes complete? | `persona_count` on the job events, correlated with `run_finished`. |
| Are thin personas visible before consequential use? | `persona_viewed` by readiness and memory-level bucket, followed by session/run events. |
| Are results actually shared? | `report_exported` by format, stakeholder/detailed audience, branding source and master source. |
| Does a published workspace identity reach generated work? | `workspace_design_published`/`workspace_design_asset_uploaded` followed by `prototype_registered` or `report_exported`. |

These definitions can be implemented as PostHog insights today and moved unchanged to another
exporter later.

## Architecture

```text
product function / successful render
              ↓
provider-neutral semantic event
              ↓
Cloud allowlist + tenant resolution + HMAC pseudonyms
              ↓
immutable local projection and retry/dead-letter outbox
              ↓
PostHog exporter (replaceable)
```

The actor and workspace come from authenticated server context, never caller-supplied
properties. Product identifiers have dedicated typed fields. Cloud resolves them inside the
active tenant before producing separate HMAC pseudonyms for viewer, workspace, project and
subject.

PostHog receives `sonaloop_<event>` names, `$process_person_profile=false`, pseudonymous
identifiers and closed structural values such as counts, booleans, modes and statuses. It
does not receive names, email addresses, titles, URLs, prompts, search terms or authored
research text. Nested/open-ended payloads and content-shaped property keys are rejected at
the Core seam; Cloud enforces an event-specific allowlist; the PostHog adapter validates the
wire shape again.

## Reliability and identity

Capture never performs provider network I/O on the product request path. The existing Cloud
outbox leases deliveries, retries failures and dead-letters exhausted attempts. A telemetry
or PostHog outage cannot change a product response. First-view markers and projections use
the configured bounded telemetry retention.

Retry-safe product functions attach stable operation or resource keys so a transport replay
does not invent another success. View events use the five-minute window. The HMAC identity
domain is provider-independent and deliberately frozen, so replacing the exporter does not
split historical viewer/workspace identities.

Telemetry is a complete no-op when audit/capture identity configuration is absent. See
[Cloud execution audit and PostHog observability](cloud-observability.md) for deployment
configuration, retention, delivery inspection and operational smoke tests.
