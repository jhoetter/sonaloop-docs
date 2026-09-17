# Website capture and editable Source

Sonaloop Web can turn an explicitly selected set of captured website routes into
an editable Next.js project. The capture remains the evidence source; generated
JSX, page-local CSS and retained assets become ordinary Git files. A successful
build confirms source integrity, not complete visual or behavioral equivalence.

## Repeated page families

Large CMS sites often render many routes from one page type. The Source writer
groups a family only when at least three routes share the same bounded structural
prefix of their single `main` landmark. It compares complete DOM topology, text
positions and attribute names—not URL words, screenshots or inferred industry
labels. Forms, embeds and canvases prevent grouping.

A proven family becomes one `PageTemplateFamilyN.tsx` component. Its shared JSX
is emitted once; values that differ between routes live in an exact route-keyed
`content` record. Modules below the common prefix stay in their own route files.
The export manifest records the member routes, structural fingerprint and field
counts. If localization or a verified interaction binding changes the promised
shape, generation fails closed and leaves the pages separate.

## Layered hero videos

A captured hero with multiple video layers becomes interactive only after the
isolated replay verifies a bounded semantic inventory, every selector, local
media availability, playback, mute, pause/resume, replay and restoration to the
initial state. Partial evidence remains a visible finding and does not authorize
generated behavior.

The generated controller uses retained local media, pauses inactive or
off-screen videos and restores a visible system cursor when the original site
hid it for a script-owned custom cursor that is not part of the export. Original
analytics, transition physics, timing and unobserved responsive states are not
claimed.

## Inspector model

The page navigator shows the route hierarchy and opens a lone site/language root
by default. The element inspector remains DOM-first: native tags, IDs, classes
and short text identify rows, while React component boundaries appear as
secondary labels. Canvas and page views share the same collapsible navigator and
inspector controls.

Before publication, qualify the generated project separately for routes, assets,
responsive rendering and every required finite interaction. Missing routes or
backend behavior are explicit scope gaps, not implied successes.
