# Feedback

The inspector carries a built-in feedback channel so a user can flag something the moment
they see it.

## Sending

A **feedback** button sits at the bottom of the inspector's sidebar. It opens a small modal:
a message (required), an optional email, and — displayed transparently, never collected
silently — the current page path and app version, which are sent along. Submissions are
validated and rate-limited per database; a no-JavaScript fallback form lives at
`/feedback/new`.

For public installs that prefer a public channel, the modal also links a **prefilled GitHub
issue** with the same context.

## Reading

- **`/feedback`** — the read-only inbox page (linked from the settings popover, deliberately
  not in the main nav).
- **`sonaloop feedback`** — lists recent submissions, newest first, and marks them read
  (`--keep-unread` to peek without consuming; `--limit N` to page). `sonaloop info` reports
  the remaining unread count.

## Forwarding: `SONALOOP_FEEDBACK_WEBHOOK`

When the `SONALOOP_FEEDBACK_WEBHOOK` environment variable is set, every submission also
POSTs a JSON payload to that URL — best-effort fan-out: a webhook failure never blocks or
loses the local submission.
