# Getting started

## The one-sentence setup (recommended)

Paste this to an **AI agent that can run commands on your machine** (Claude Code, Cursor,
Codex, or a desktop agent with terminal access):

```text
Set up Sonaloop for me and walk me through a first project. Do every step yourself and keep
me posted; I just want to talk, not configure anything.

1. Install the `sonaloop` CLI in whatever way fits this environment — try `uv tool install
   sonaloop`, else `pipx install sonaloop`, else `pip install --user sonaloop`.
2. Run `sonaloop setup` (it fetches a headless browser) and `sonaloop info` to confirm.
3. Start the web inspector in the background by running `sonaloop-web`, then tell me the URL
   it prints — http://localhost:8787 — so I can watch everything live.
4. If this app supports MCP servers, also register Sonaloop as one (command: `sonaloop-mcp`)
   so you can drive it with native tools.
5. Then read `sonaloop guide` and take me through my first project.
```

## Manual setup

Install the CLI, then register the MCP server with your host:

```bash
uv tool install sonaloop     # or: pipx install sonaloop / pip install --user sonaloop
sonaloop setup               # fetches the headless browser for screenshots/PDF export
```

For **Claude Code**:

```bash
claude mcp add sonaloop -- sonaloop-mcp
```

For **Claude Desktop / Cursor** add to your MCP config:

```json
{
  "mcpServers": {
    "sonaloop": { "command": "sonaloop-mcp" }
  }
}
```

Start the inspector with `sonaloop-web` and open <http://localhost:8787> — it shows
everything your agent records, live.

## First steps

1. Create a research project and 4–6 personas (your agent does this conversationally —
   `sonaloop guide` prints the operating contract it follows).
2. Run a council on a real question ("What should the premium tier cost?").
3. Read the synthesis in the inspector; follow up with a head-to-head or a red-team pass.

The [Job → Framework → Format taxonomy](job-framework-format.md) explains the shapes a
study can take and when to use which.
