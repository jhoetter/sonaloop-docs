# Reports, PowerPoint masters, and design hand-offs

Sonaloop can deliver research in two editable directions:

- branded PDF and PowerPoint reports for stakeholders; and
- a provider-neutral MCP hand-off for Figma, canvas, code, and document tools.

The two paths are independent. A PowerPoint master belongs to the workspace; a design
destination such as Figma remains connected to the AI host, not to Sonaloop.

## Upload a PowerPoint master

Workspace owners open **Workspace → Templates** and upload a `.pptx` file. The master
must use a 16:9 widescreen canvas.

Sonaloop keeps the reusable presentation structure:

- theme and theme fonts;
- slide masters and named layouts;
- layout backgrounds, fixed artwork, and placeholders; and
- page size and document properties.

Concrete slides from the uploaded file are removed immediately. The stored template has
zero content slides. Uploads with macros, embedded objects, ActiveX, or external links are
rejected. Sonaloop inspects theme colors and fonts, placeholder geometry, and the available
slide purposes. The settings page shows a simple **Ready** or **Limited** result plus the
purposes the template supports; technical details stay in the advanced deck settings.

New PowerPoint exports choose the closest company layout for cover, agenda, section,
content, comparison, personas, stimulus screens, image, and closing slides. Layout names are recognized in common
languages; opaque agency names fall back to the portable structure of their title, body,
picture, and multi-column placeholders. Report text and images populate native placeholders
where available, while editable shapes and charts are fitted to the layout's content grid.

The master owns the exported presentation's backgrounds, fixed artwork, fonts, and colors.
Sonaloop derives chart and card colors from its theme and layout artwork; it does not layer
the separate workspace web palette on top. It also does not add its own canvas, logo,
footer, or forced font. Every export runs a content-free fidelity check for unchanged master
parts, slide bounds, layout usage, placeholder use, font overrides, and off-theme colors.

## Build the presentation story

The master supplies the brand, but it does not write the presentation. Once a report is
complete, Sonaloop gathers its method, findings, personas, screenshots, evidence, and
limitations. The connected AI host uses those inputs and the method's presentation profile
to create a reusable deck plan.

The short main story normally moves from conclusion to visual evidence to the concrete
decision or next action. Depending on the method, this can include:

- the actual stimuli side by side;
- the participating personas on one overview slide;
- a before-and-after preference or confidence shift;
- an annotated screen with the exact revision;
- quotes, charts, risks, and recommended next steps.

Detailed persona profiles, individual response matrices, method notes, limitations, and a
source index move to the appendix. Sonaloop does not create filler agendas for short decks
or finish with an empty thank-you slide.

Every slide has native PowerPoint speaker notes. They can hold the key takeaway, full talk
track, source references, limitations, backup details, transition to the next slide, and
suggested timing. The slide itself can therefore stay visual and concise without losing the
researcher's reasoning.

This makes the deck a stakeholder projection rather than an engine trace. It does not copy
report sections one-for-one. Full prose, source identities, citations, and audit detail
remain in Sonaloop, while evidence references keep the presentation traceable.

Replacing a master affects only new exports. Existing files do not change.

## Customer-facing result states

The normal Cloud customer view describes what the user can do, not the internal health of
an autonomous agent run. Once a durable report, synthesis, prototype, outcome, or
deliverable exists, the job reads **Result ready**. A paused or expired internal run does
not turn a useful result into an error.

Global run-attention widgets, run chips, journals, setup plans, and engine-health language
stay out of the customer surface. Owners and operators retain that technical view for
audit and recovery. A real missing user choice remains visible as **Input required**.

## Continue in Figma or another design tool

The read-only `get_design_handoff` MCP tool returns a bounded
`sonaloop.design_handoff.v1` bundle for one project. It includes:

- the research goal and selected reports;
- compact persona context;
- findings and persona voices with evidence references;
- open questions, behavioral predictions, and decisions;
- existing concepts, prototypes, flow screens, visual asset handles, and usability results;
- the active workspace's brand, colors, typography, layout, and chart tokens; and
- a generic destination workflow.

The bundle does not contain local filesystem paths, run commands, destination credentials,
or a hidden Figma integration. Visual sources include exact Sonaloop `view_asset` calls so
the host can fetch only the screens it needs.

### Recommended multi-MCP workflow

Connect Sonaloop and the destination MCP separately in the same AI host. Then ask:

> Get the design hand-off for this Sonaloop project. Use the connected design tool to
> create or update the requested artifact. Preserve the workspace tokens, keep evidence
> references in the rationale, and leave unresolved questions visible.

The host reads the Sonaloop hand-off, fetches required screens, and writes through the
destination MCP. Figma can therefore grant access to one file or library rather than to an
entire account. The same workflow works with other design, canvas, code, or document tools.

If the destination produces a shareable interactive URL, the host can register it back in
Sonaloop with `register_remote_prototype` and run the normal persona/usability validation
loop. Sonaloop stores the URL as metadata and does not need the destination token.

## Evidence boundary

A screenshot proves product state, not observed behavior. The hand-off preserves claim
posture and source refs so a destination agent cannot honestly promote a hypothesis into a
measured fact. Recorded usability sessions remain the behavioral evidence.
