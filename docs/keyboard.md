# Keyboard, palette & tour

The inspector is keyboard-first. One registry declares every binding; the `?` cheat sheet
and the client keymap are both generated from it, so the overlay can never drift from the
real bindings. (The full cross-surface contract for other Sonaloop apps lives in the core
repo: [`docs/keyboard-conventions.md`](https://github.com/jhoetter/sonaloop-research/blob/main/docs/keyboard-conventions.md).)

## Bindings

| Keys      | Scope  | Action |
|-----------|--------|--------|
| `?`       | Global | Open/close the shortcuts cheat sheet |
| `⌘K` / `Ctrl+K` | Global | Open the command palette |
| `g` `h`   | Global | Go home |
| `g` `p`   | Global | Go to personas |
| `g` `c`   | Global | Go to councils |
| `g` `s`   | Global | Go to syntheses/reports |
| `g` `a`   | Global | Go to activity |
| `g` `r`   | Global | Go to runs |
| `g` `d`   | Global | Go to documentation |
| `Esc`     | Global | Close overlays (incl. an open slide-over); cancel a pending chord |
| `j` / `k` | Lists & project outline | Move row focus down/up |
| `Enter`   | Lists & project outline | Open the focused row as a **slide-over** (full detail page, real URL) |
| `o`       | Lists & project outline | Open the focused row straight as a full page |
| `[` / `]` | Detail | Previous / next sibling record |

The slide-over is the row's full detail page in a right-hand panel (see
[the live inspector](live-inspector.md#getting-around-four-items-one-model)): `Enter`
opens it (the URL becomes the real detail URL), `Esc` or Back closes it, and the ⤢ control
expands to the full page — middle-click and deep links bypass the panel entirely.

Behavior rules worth knowing:

- **Typing guard** — every binding is disabled while focus is in an input, textarea, select
  or contenteditable element (`Esc` may still close an overlay, but never clears your text).
- **No modifier shadowing** — plain-key bindings never fire while `⌘`/`Ctrl`/`Alt` is held,
  so native browser shortcuts stay untouched.
- **Chords** — `g` opens a short (~900 ms) chord window; an unknown second key or `Esc`
  cancels silently.
- The modifier glyph renders `⌘` on macOS and `Ctrl` elsewhere.

## The command palette (`⌘K` / `Ctrl+K`)

One registry-driven search over everything in the database — projects, personas, open
questions, references, councils, reports, prototypes, flows, sections, notes, sessions,
hypotheses, decisions, surveys and assets — plus **jump commands** derived from the
navigation (including pages added by extensions). Type to filter, `Enter` to open.

## The product tour (local/single-user Core)

In local/single-user Core, an optional tour loads the onboarding showcase project if
needed, then walks real project objects: open question, reference, council, survey, report,
flow, prototype, session, hypothesis, decision, note, asset and the Library. It uses
anchored spotlights + tooltips, progress dots, Back/Next/Skip; `Esc` ends it. It **never
auto-starts**:

- **Take the tour** is available in the user menu and prominent on the empty-database
  home page.

Steps whose target isn't on the current page are skipped automatically, so the tour works
from anywhere.

Shared Postgres row-tenanted Cloud disables the tour and its onboarding-showcase browser
loader by default. This keeps prepared customer workspaces focused on their own research
and prevents the onboarding surface from adding demo records. An operator can explicitly
override the default with `SONALOOP_PRODUCT_TOUR_ENABLED`.
