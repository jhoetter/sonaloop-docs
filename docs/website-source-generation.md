# Editable website source

Sonaloop can turn an explicitly selected set of captured pages into a private,
editable Next.js project. The generated source is a new working branch: it does
not overwrite an existing customer branch, publish a website, or re-enable the
original site's analytics, forms, or other third-party scripts.

## How multi-page sites stay maintainable

The generator treats a site as one codebase rather than a collection of
unrelated screenshots. It derives stable names from routes and accessible page
structure, so files use names such as `DeHomePage` and
`DeReferenzBaywaPage` instead of page numbers.

When at least three pages contain the same safe static header or footer
structure, Sonaloop writes the JSX once under `components/site/`. Text, links,
active navigation classes, localized assets, and source-element identities
remain explicit per-route data. Repeated page structures can similarly become a
named page template. Supported YouTube captures use one validated,
click-to-load component under `components/media/`.

Large repeated static navigation rows inside a proven component are written as
typed data plus one ordinary JSX `.map()`, rather than dozens of copied links.
The generator applies this only when the output is materially smaller and the
DOM order, stable keys, route state, and source identities can all be preserved.
An exact screen-reader-only “current” marker is represented by native
`aria-current`; other structural differences remain separate components. This
keeps shared headers readable without treating every route as a new design.

The detector is conservative. Forms, frames, canvas content, embedded
applications, observed interactive states, and structurally different regions
remain separate. A smaller file count is useful, but it is never accepted as
evidence that behavior or appearance stayed correct.

## The quality loop

Each generator revision creates a fresh candidate and keeps the pinned capture
evidence unchanged. A candidate is accepted only after the relevant checks pass:

1. deterministic regeneration from the same inputs;
2. TypeScript and production Next.js build;
3. every selected route at the required desktop and mobile profiles;
4. DOM, geometry/style, runtime-error, and editor-binding checks;
5. explicit checks for retained menus, carousels, media, and hero states; and
6. an instance edit proving that changing one route does not silently change
   another route.

An optional model may suggest a clearer name or a possible component boundary.
It cannot change capture scope, weaken a behavior boundary, certify its own
output, or merge a candidate. Structural equivalence and acceptance remain
deterministic and independently checked.

## What the inspector preserves

Shared code does not collapse rendered elements into one inspector row. Each
route instance keeps its own source anchor and capture identity, and supported
text or link cells remain editable in that instance. The Source manifest records
the exact route coverage and component families so an agent can explain why a
piece of code is shared.

Generated source is a reconstruction of the retained, observed scope. A green
build does not claim complete original JavaScript, backend behavior, animation
timing, or unobserved responsive states. Those capabilities need their own
evidence and qualification.
