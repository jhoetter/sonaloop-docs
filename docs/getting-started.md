# Getting started

## The one-sentence install (recommended)

If your agent host speaks MCP, one line is the whole setup (needs
[`uv`](https://docs.astral.sh/uv/)):

For **Claude Code**:

```bash
claude mcp add sonaloop -- uvx sonaloop-mcp
```

For **Claude Desktop / Cursor / any MCP host**, add to the host's MCP config:

```json
{
  "mcpServers": {
    "sonaloop": { "command": "uvx", "args": ["sonaloop-mcp"] }
  }
}
```

That's it — no data dir, no `.env`, no setup step. The server bootstraps itself on first
touch, and the first tool call on a fresh database answers with an **orientation note**
(what to create first: project → personas → council), so the agent knows the way without
reading anything.

Optional extras come later: `sonaloop setup` fetches the headless browser for prototype
testing, and an `OPENAI_API_KEY` enables avatars + semantic recall. **`sonaloop info`**
prints diagnostics — data dir, DB, optional providers, MCP wiring — and the exact one-liners
to fix whatever is missing. Every supported environment variable is listed with a one-line
explanation in the core repo's
[`.env.example`](https://github.com/jhoetter/sonaloop/blob/main/.env.example).

## First step: load an example project

Before running your own study, look at a finished one. Two complete demo studies ship with
the install — a B2B positioning council and a B2C pricing study (price ladder + €19 vs €49
head-to-head). Ask your agent to call `load_example`, run `sonaloop load-example`, or click
**Load example** on the inspector's empty home page. Loading is idempotent and
`remove_example` removes exactly that data again — details in [Example projects](examples.md).

Start the inspector with `sonaloop-web` and open <http://127.0.0.1:8787> — it shows
everything your agent records, **live** (toasts + auto-reloading pages; see
[The live inspector](live-inspector.md)).

## Or: paste this to your AI agent

No setup knowledge needed. Paste this into an **AI agent that can run commands on your
machine** (Claude Code, Cursor, Codex, or a desktop agent with terminal access):

```text
Set up Sonaloop for me and walk me through a first project. Do every step yourself and keep
me posted; I just want to talk, not configure anything.

1. Install the `sonaloop` CLI in whatever way fits this environment — try `uv tool install
   sonaloop`, else `pipx install sonaloop`, else `pip install --user sonaloop`.
2. Run `sonaloop setup` (it fetches a headless browser) and `sonaloop info` to confirm.
3. Start the web inspector in the background by running `sonaloop-web`, then tell me the URL
   it prints — http://localhost:8787 — so I can watch everything live.
4. If this app supports MCP servers, also register Sonaloop as one (command: `sonaloop-mcp`)
   so you can call its tools directly. Otherwise just drive it via the `sonaloop` CLI — both work.
5. Run `sonaloop guide` and follow it exactly. The key rule: YOU author every piece of text
   (personas, days, council answers, syntheses) — Sonaloop only gathers context and persists.
6. Ask me what I want to research or simulate (any domain). Then create a few personas,
   simulate a little of their lives, run a council on my question, and synthesize the result —
   pointing me to the inspector to read each one.
```

## Manual setup (permanent install)

Install the entrypoints (`sonaloop` CLI · `sonaloop-mcp` · `sonaloop-web`), then register
the MCP server with your host:

```bash
uv tool install sonaloop     # or: pipx install sonaloop / pip install --user sonaloop
sonaloop setup               # fetches the headless browser for screenshots/PDF export
claude mcp add sonaloop -- sonaloop-mcp     # Claude Code; other hosts: {"command": "sonaloop-mcp"}
```

## First study

1. Create a research project and 4–6 personas (your agent does this conversationally —
   `sonaloop guide` prints the operating contract it follows).
2. Run a council on a real question ("What should the premium tier cost?").
3. Read the synthesis in the inspector; follow up with a head-to-head or a red-team pass.

The [Job → Framework → Format taxonomy](job-framework-format.md) explains the shapes a
study can take and when to use which — including the run protocols behind the A/B test,
pricing and ideation Jobs.
