# The live inspector — navigation, events, activity, runs

!!! note "Customer result surface"
    The normal shared-Cloud customer experience is result-first. When a durable report,
    synthesis, prototype, outcome, or deliverable exists, a job reads **Result ready** even
    if an underlying agent run later paused or expired. Global attention/run widgets, run
    chips, journals, setup plans, and engine-health language remain on the owner/operator
    surface. A real missing customer choice still appears as **Input required**.

The web inspector (`sonaloop-web`, <http://127.0.0.1:8787>) is not a static viewer: it
follows the work as your agent records it.

## Getting around: four items, one model

The sidebar has exactly four entries — **Projects · Personas · Library · Activity**
(Settings and the documentation hub live in the footer). One mental model runs the whole
app: *project → phases → rows; click = slide-over.*

- **The project is the home.** Everything a study produces or uses — open questions,
  references, councils, reports, flows, prototypes, sessions, surveys, hypotheses,
  decisions, notes and assets — renders as a row in its phase context on the project
  outline. The project header carries a **run chip** (state · last activity) that links
  to the run journal and the complete participating **persona cohort** as linked avatars;
  dense list rows still collapse cohorts after four portraits. Missing setup is represented there as one current action rather
  than as full-width warning cards. Persisted Product Understanding and cohort-check
  evidence remains available behind one small, closed **Research setup details** row;
  archived status and explicit lineage stay compact in the header.
- **The Projects/Jobs overview is the current working set.** Archived jobs no longer appear
  in the normal overview, in the project results offered by `⌘K`/`Ctrl+K`, or in a
  methodology page's related-job discovery. They are also excluded from the Runs overview,
  the global run-status widget and its `GET /api/runs` payload. Archiving does not delete the
  job: an exact
  `/jobs/{project_id}` detail link still resolves, including its retained evidence and
  lineage. This keeps old retries and canaries out of everyday navigation without turning
  archive into data loss or making an archived title discoverable by fuzzy search.
- **Jobs rows stay quiet but actionable.** Horizontal separators are omitted. Favorite and a
  three-dot menu sit together at the right edge; the menu offers a title-only **Rename** and the
  typed-confirmation **Delete job** action. Never-started containers hard-delete. Jobs with terminal
  run history leave the working set through evidence-preserving archive, while active runs remain
  protected until explicitly finished or stopped.
- **Rows and slide-overs.** Every primitive renders as the same row anatomy everywhere
  (icon · title · quiet input/output degree · right-aligned meta). A degree appears only when
  a persisted relationship exists; hovering or focusing the row reveals the corresponding rows
  without turning the outline into a permanent web of lines. Clicking a row opens its **full detail
  page as a slide-over** (Notion-style): the list stays visible behind the panel, and the
  address becomes the real detail URL — reloading or sharing it loads the full page. The ⤢
  control in the panel header expands to the full page; `Esc`, the backdrop, or the browser's
  Back button restores the list and its URL. Slide-overs are navigation sugar, never the only
  address (middle-click and deep links go straight to the page).
- **Sessions disclose their visual evidence before you open them.** A session row says
  **Screen replay**, **Some screens**, or **No screen**. In the replay itself, a missing
  screenshot is a minimal explicit empty state; a historical `state.screen` description
  remains readable as text but is never framed like a broken or loading image.
- **The Library** is the cross-project browser: one page with tabs for open questions,
  references, councils, reports, prototypes, flows, sessions, surveys, hypotheses,
  decisions, notes and assets, one search/filter bar, the same rows + slide-overs as the
  project outline. The old per-kind routes (`/councils`, `/decisions`, …) still resolve —
  they render the Library with that tab active. Naming matters: **references** are
  websites/external prototypes/A-B variants in the council room; **assets** are files;
  **sessions** are usage traces.

## The Workbench screen Canvas

The Workbench project Canvas treats a customer capture and its code variants as related
screens rather than a flat screenshot list:

- **Screen search ignores the current filters.** `Cmd+K` on macOS or `Ctrl+K` elsewhere
  searches every captured and variant screen in the Canvas by route, state, viewport,
  issue and variant. Choosing a result admits any required view kind or viewport, clears
  transient searches that hid it, then selects and centres the screen.
- **Light and Dark are states of one logical screen.** Sonaloop stores each available
  capture unchanged and follows the effective Workbench theme automatically. Light never
  exposes a dark-only screen. Dark prefers real Dark evidence and falls back to the saved
  Light capture when no Dark state exists; there is no per-card theme override and no
  recolouring of evidence.
- **Play is qualified and warm, not eager.** Its count and selector contain the verified
  Current version plus ready variants for that screen. Live sessions are created only when
  selected and opened sessions are reused in the current tab. The standalone immutable
  Variant presentation best-effort warms only the closest neighbouring options (up to three),
  with two shared speculative loads and at most four retained replay documents/frames. A large
  issue backlog therefore does not trigger an all-variant download or iframe storm, while
  common adjacent switches avoid another cold start.
- **The inspector floats over the full stage.** Only the inspector card is opaque; its
  surrounding layer is transparent. The Canvas continues underneath at full width, so no
  reserved grey column clips a screen behind the overlay.

Three pieces make the *live* part work.

## Research setup without debug-wall UI

Product Understanding and Cohort Integrity are methodological setup evidence, not another pair of
report chapters. Their default presentation therefore answers the decision question first and keeps
the audit trail one disclosure away:

- **Product Understanding** starts as one closed summary: how many product areas are evidenced, how
  many remain open, and whether verified absences or conflicts need attention. Opening it reveals the
  target/revision, then separate evidenced and open-area lists. Raw manifest ids, record versions,
  digests and observation time do not appear in the normal Inspector; they remain available through
  the service result, run journal and exports. Capability claims keep their exact evidence links.
- **Cohort Integrity** starts as one closed summary: pass/attention state, cohort size, grounded
  countervoice coverage and thin-profile count. Opening it explains the independent-context boundary;
  overlap metrics and policy data, then the per-persona provenance basis, are nested disclosures.
  Required remediation and explicit override limitations remain visible when they matter.

Closing a disclosure changes presentation only. The complete methodological record stays in the
service result, run journal and exports. Completed checks use neutral, borderless disclosure rows; state comes from
plain-language copy and semantic badges, not a decorative success rail or a full-width warning card.

## Dates follow the reader, not the server

Persisted timestamps and API/audit records remain canonical UTC instants. Human-facing inspector
timestamps render as semantic `<time datetime="…">` elements and are formatted with the browser's
locale and timezone. A user in Switzerland therefore sees the Swiss local time even when Sonaloop is
hosted on a UTC server. The full localized instant is available in the timestamp tooltip.

The same conversion runs after live/SSE updates, SPA navigation and slide-over insertion, so a newly
arrived row cannot fall back to server time. Server-rendered UTC remains the honest no-JavaScript
fallback; changing the UI timezone never mutates stored evidence or audit chronology.

## The event bus

The MCP server, the CLI and the web inspector are separate processes sharing one SQLite
database, so the inspector can't see in-process emissions directly. A built-in `'*'`
subscriber appends every emitted lifecycle event to a durable `events` table: monotonic id,
timestamp, event name, the primary entity (+ owning project), and a short label + inspector
URL. The table is capped to the newest ~1000 rows on append; the append is best-effort and
never breaks the recording operation.

See [Lifecycle hooks](lifecycle-hooks.md) for the event catalogue and how to subscribe your
own handlers/webhooks.

## SSE: `/api/events`

The web app tails the events table and re-publishes it as a plain Server-Sent-Events stream:

- `GET /api/events` — each frame's `id:` is the bus row id, so an `EventSource` reconnect
  replays missed rows via `Last-Event-ID` automatically. A heartbeat comment keeps proxies
  from killing idle connections.
- Every inspector page connects on load: a new event shows a small **activity toast**
  linking to the recorded entity, and the page **reloads itself** when an event concerns the
  entity/project currently on screen — your agent records a council in one window, the open
  project page updates in the other.
- **`/activity`** — the Activity feed page listing the recent bus rows (keyboard: `g` `a`).

Tuning knobs: `SONALOOP_EVENTS_POLL` (table-poll seconds, default 1) and
`SONALOOP_EVENTS_HEARTBEAT` (heartbeat seconds, default 15).

## The runs panel

Long-running studies are driven by the governed run loop. Normal Cloud clients enter it through
`begin_research_job` for a new job or `continue_research_job` for an existing job; Core/local hosts
can use the lower-level `start_run` → `run_step` → `checkpoint_step` route. The inspector keeps that
visible:

- A **topbar widget** on every page: a status dot + active-run count, with a flyout listing
  the active runs (project, last activity). The dot turns **amber when any project needs
  attention** — its governed run never started, an active run went quiet, or its previous run
  stopped/hit its cap. Those states use different copy, so the UI never claims that an unstarted or
  stopped job is a running worker. When active and attention states coexist, the attention count
  takes precedence instead of hiding silent failures behind unrelated progress. The widget live-updates off the
  same SSE stream and degrades gracefully to the server-rendered state without JavaScript.
  Archived jobs never contribute to its rows or counters.
- A **run chip in each project's header** (state · last activity) linking to the journal —
  run state belongs to the project, so it surfaces where the project lives.
- **`/runs`** — the run journal (keyboard: `g` `r`; deliberately not a nav item): every
  non-archived project's run state grouped into active / stalled / engine-finished / unverified. Stalled and
  unverified rows name the unmet invariant, last safe operation, idempotent recovery call and
  redacted support-trace reference.
- **`GET /api/runs`** — the same archive-filtered data as JSON (what the widget refetches).

Councils and reports show evidence health at the point of use; Jobs keep the same detail behind
their compact setup disclosure: Product Understanding
revision/coverage/verified absences/unknowns, explicit claim posture and source counts, and exact
authorized evidence links. A long report never earns a trust badge from prose length. Explicit
superseding or archiving preserves the prior job and its evidence rather than silently deleting it.
The archived job leaves normal overview, palette, methodology and run-status discovery, while its
exact detail URL remains the durable hand-off for audit and support.

In Cloud, tell the connected MCP host to continue an unfinished job. With an exact job id it calls
`continue_research_job` directly; otherwise `list_unfinished_research_jobs` finds candidates. One
match is selected, while several require a user choice. Continuation resumes the sole active run or,
under the strict missing/repair rules, creates one deterministic governed run and drives that id
until the engine says `done`. Legacy front-door projects whose run budget was never persisted instead
return `original_begin_retry_required`: the host must repeat the original `begin_research_job` call
with exactly the same arguments, because Sonaloop will not guess the missing budget. Continuation
never creates a replacement job.

Extensions can add their own sections to the `/runs` page through the
`register_runs_section` seam (sonaloop-cloud uses it to show cloud run assignments).
