# Secure remote screenshots

Reaction Tests are only useful when personas react to the product that actually exists. A
remote MCP client can now provide that stimulus without giving the Cloud server a URL fetcher,
browser or filesystem path.

## The safe path

The workspace agent follows one explicit sequence:

1. start the research job and obtain the Product Understanding dispatch;
2. call `admit_remote_screenshot` once per screen, with direct base64 bytes and a stable
   `operation_id`;
3. call `record_flow_manifest` with the ordered admitted asset-version ids and labels;
4. inspect every screen through `view_asset`;
5. call `record_product_understanding` with the exact manifest id, version, digest, target
   revision and one coverage entry per screen;
6. continue the governed run.

The upload tool has no URL or local-path parameter. This removes SSRF, redirect rebinding and
host-file reads from the reachable workspace-user contract. The generic local `attach_asset`
and browser tools remain unavailable over Remote MCP.

## What is checked

Only single-frame PNG, JPEG and WebP screenshots are accepted. Before a screen becomes evidence,
Sonaloop checks:

- canonical base64 and a 10 MB limit;
- filename extension, declared MIME, file magic and Pillow's decoded format;
- the exact image-container end, so appended HTML/scripts or other polyglots fail;
- full Pillow verification and decoding under dimension, pixel and decoded-memory limits;
- the EICAR test signature; and
- the configured external content/virus scanner.

The built-in EICAR check is deliberately narrow and is not marketed as general antivirus.
Customer Cloud fails closed without a real external scanner: unavailable, timed-out and
non-zero scanner runs reject the upload before admission. Operators configure it as a JSON
argument array, never a shell command:

```dotenv
SONALOOP_REMOTE_ASSET_SCANNER_ARGV_JSON=["/usr/bin/clamscan","--no-summary","{path}"]
SONALOOP_REMOTE_ASSET_EXTERNAL_SCAN_REQUIRED=1
SONALOOP_REMOTE_ASSET_SCANNER_TIMEOUT_SECONDS=30
```

Exact retries reuse the immutable verdict. A local/development receipt that lacks a clean
external-scan policy digest is rejected if it is later restored into an environment where an
external scanner is required; replay cannot promote unscanned bytes into production evidence.

## Retry and tenancy guarantees

The authenticated workspace, project, run, operation id and Product Understanding dispatch are
all part of the admission identity. Repeating the exact call returns the original asset; changing
bytes or provenance under the same operation id is rejected. The immutable record contains the
full SHA-256 and scan receipt. Equal bytes in different workspaces have different authorization
ids and cannot be read across the workspace boundary.

Screenshot bytes are never copied into the Cloud execution ledger or PostHog, even if optional
content tracing is enabled. Observability records the safe digest, size, image metadata, tool
outcome and correlation ids instead.

## Frozen flow and Product Understanding versions

A flow manifest is append-only. Each version freezes the ordered screen-version ids/digests,
labels, expected task, target revision and capture time. A new version points to the previous one;
it never rewrites it.

Product Understanding must cite one exact manifest version and cover every screen as inspected.
Its revision must match the manifest's target revision. That exact binding is copied into the
Product Understanding version, so uploading or recording a newer flow later cannot change what
an earlier Reaction Test actually evaluated. Reaction claims are accepted only against that
manifest and those exact covered asset versions; a later upload needs a new preflight before it can
enter the test. If admission or coverage fails, the run stays blocked instead of silently continuing
without evidence.
