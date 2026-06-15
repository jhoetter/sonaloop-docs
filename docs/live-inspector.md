# The live inspector — navigation, events, activity, runs

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
  to the run journal.
- **Rows and slide-overs.** Every primitive renders as the same row anatomy everywhere
  (icon · title · status pills · right-aligned meta). Clicking a row opens its **full detail
  page as a slide-over** (Notion-style): the list stays visible behind the panel, and the
  address becomes the real detail URL — reloading or sharing it loads the full page. The ⤢
  control in the panel header expands to the full page; `Esc`, the backdrop, or the browser's
  Back button restores the list and its URL. Slide-overs are navigation sugar, never the only
  address (middle-click and deep links go straight to the page).
- **The Library** is the cross-project browser: one page with tabs for open questions,
  references, councils, reports, prototypes, flows, sessions, surveys, hypotheses,
  decisions, notes and assets, one search/filter bar, the same rows + slide-overs as the
  project outline. The old per-kind routes (`/councils`, `/decisions`, …) still resolve —
  they render the Library with that tab active. Naming matters: **references** are
  websites/external prototypes/A-B variants in the council room; **assets** are files;
  **sessions** are usage traces.

Three pieces make the *live* part work.

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

Long-running studies are driven by the governed run loop (`start_run` → `run_step` →
`checkpoint_step`). The inspector keeps that visible:

- A **topbar widget** on every page: a status dot + active-run count, with a flyout listing
  the active runs (project, last activity). The dot turns **amber when any project is
  stalled** — the silent failure mode is deliberately loud. The widget live-updates off the
  same SSE stream and degrades gracefully to the server-rendered state without JavaScript.
- A **run chip in each project's header** (state · last activity) linking to the journal —
  run state belongs to the project, so it surfaces where the project lives.
- **`/runs`** — the run journal (keyboard: `g` `r`; deliberately not a nav item): every
  project's run state grouped into active / stalled / finished.
- **`GET /api/runs`** — the same data as JSON (what the widget refetches).

Extensions can add their own sections to the `/runs` page through the
`register_runs_section` seam (sonaloop-cloud uses it to show cloud run assignments).
