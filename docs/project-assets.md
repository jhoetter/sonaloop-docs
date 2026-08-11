# Project assets — files, images & screenshots as evidence

The biggest credibility gap is personas reasoning from prompts instead of real
material. Assets close it: any file — a screenshot of your onboarding, a pricing
page capture, an interview note, a PDF — attaches to a research project as
first-class, citable evidence with a stable id. `brief_council` automatically
puts every project asset in the room, so reactions are grounded in what is
actually there.

Terminology: assets are **files**. Council-room websites, external prototype links and
A/B variants are **references** (`add_artifact`, surfaced under `/references`), not
assets. Replayable uses of a flow, prototype or live URL are **sessions**.

## Attaching

```bash
# MCP (the natural path — an agent attaches material while it works):
attach_asset(project_id, path="/tmp/onboarding-step2.png", title="Onboarding step 2")
attach_asset(project_id, content_base64=…, filename="interview-01.md")
attach_prototype_shot(project_id, prototype_id)   # screenshot a registered prototype

# CLI parity:
sonaloop asset-attach <project_id> ./pricing.png --title "Pricing page" --notes "v2 draft"
sonaloop asset-list <project_id>
sonaloop asset-remove <project_id> <asset_id>
```

Binaries land in the content-addressed store (`data/assets/<hash>.<ext>`); the
record lands on the project. Local single-user mode serves that file at
`/data/assets/…`. Multi-tenant Cloud instead stores it below the bound
workspace and deliberately returns 404 for raw runtime-file routes. Browser
previews and downloads use `/assets/{asset-id}/content` (or `/preview`): the
authenticated route resolves the opaque id only inside the active workspace.
Unsafe active formats such as SVG and HTML are download-only. Authorized agents
still receive image pixels through `view_asset`. Ids are content-addressed per
project, so re-attaching the same bytes is an idempotent upsert. `kind` (image |
screenshot | document | file) is inferred from the extension. Attaching emits
the `asset.attached` lifecycle event (docs/lifecycle-hooks.md).

## The multimodal contract

Images are evidence, not just storage: **`view_asset(project_id, asset_id)`
returns the actual image** over MCP, so the host LLM looks at it with its own
eyes before authoring persona reactions — no in-process vision, no OCR. Text
documents carry an inline excerpt (quoted directly in council briefs); other
binaries are cited by id.

In a council brief, every project asset rides each participant's
`agent_context` as an `EVIDENCE ASSETS IN THE ROOM` block: image assets
instruct the host to `view_asset` them first; document excerpts are inline.

## Persistence

- Assets appear read-only in the project outline, the Library's Assets tab (`/assets`) and
  `/assets/{id}` detail pages in the web inspector. Local mode may render thumbnails from
  the static `/data` mount; tenant Cloud serves them through the authenticated,
  active-workspace-only asset route and does not expose that raw mount. Incoming files
  are grouped as Assets in the outline; generated documents appear as deliverables.
- Several assets in a project or report detail render as a compact responsive gallery instead of one
  tall full-width column. Wide viewports place bounded previews horizontally and wrap as needed;
  narrow viewports collapse to one column. A thumbnail is navigation, not replacement evidence:
  ordering and captions remain intact, each file opens its canonical detail, and print/export restores
  the figure's natural height. Explicitly positioned report figures and charts keep normal reading
  width.
- `export-snapshot` now includes research projects and copies asset binaries to
  `data/export/assets/`; `import-snapshot` restores both — the evidence survives
  the portable round-trip.
