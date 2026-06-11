# The live inspector — events, activity, runs

The web inspector (`sonaloop-web`, <http://127.0.0.1:8787>) is not a static viewer: it
follows the work as your agent records it. Three pieces make that work.

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
- **`/runs`** — the full page (keyboard: `g` `r`): every project's run state grouped into
  active / stalled / finished.
- **`GET /api/runs`** — the same data as JSON (what the widget refetches).

Extensions can add their own sections to the `/runs` page through the
`register_runs_section` seam (sonaloop-cloud uses it to show cloud run assignments).
