# Keyboard, palette & tour

The inspector is keyboard-first. One registry declares every binding; the `?` cheat sheet
and the client keymap are both generated from it, so the overlay can never drift from the
real bindings. (The full cross-surface contract for other Sonaloop apps lives in the core
repo: [`docs/keyboard-conventions.md`](https://github.com/jhoetter/sonaloop/blob/main/docs/keyboard-conventions.md).)

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
| `Esc`     | Global | Close overlays; cancel a pending chord |
| `j` / `k` | Lists  | Move row focus down/up |
| `Enter`   | Lists  | Open the focused row |
| `[` / `]` | Detail | Previous / next sibling record |

Behavior rules worth knowing:

- **Typing guard** — every binding is disabled while focus is in an input, textarea, select
  or contenteditable element (`Esc` may still close an overlay, but never clears your text).
- **No modifier shadowing** — plain-key bindings never fire while `⌘`/`Ctrl`/`Alt` is held,
  so native browser shortcuts stay untouched.
- **Chords** — `g` opens a short (~900 ms) chord window; an unknown second key or `Esc`
  cancels silently.
- The modifier glyph renders `⌘` on macOS and `Ctrl` elsewhere.

## The command palette (`⌘K` / `Ctrl+K`)

One registry-driven search over everything in the database — projects, personas, councils,
reports, prototypes, sections, notes, sessions, hypotheses, decisions and surveys — plus
**jump commands** derived from the navigation (including pages added by extensions). Type to
filter, `Enter` to open.

## The product tour

An optional 60-second tour walks the chrome in six anchored steps (spotlight + tooltip,
progress dots, Back/Next/Skip; `Esc` ends it). It **never auto-starts**:

- On a visitor's first page a one-time, dismissible toast offers it (the offer appears
  exactly once per browser, dismissed or not).
- **Take the tour** is prominent on the empty-database home page; **Restart tour** lives in
  the settings popover.

Steps whose target isn't on the current page are skipped automatically, so the tour works
from anywhere.
