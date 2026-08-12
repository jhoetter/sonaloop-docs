# Cloud workspaces and customer access

Sonaloop Cloud is the hosted, multi-user layer over `sonaloop-research`.
Research records and runtime files are scoped to one workspace; a customer does
not share a data root with another customer.

## Identity and account creation

Cloud uses standards-compliant OpenID Connect (OIDC), using Authorization Code
with PKCE. The configured identity provider owns account creation, password
reset and multi-factor authentication. Sonaloop never stores customer
passwords. A managed provider that offers hosted email/password registration
therefore gives customers a normal email signup without requiring Google
accounts.

Production callbacks accept only signed `RS256` or `ES256` ID tokens and check
the issuer, audience, expiry, nonce and authorized party. UserInfo must return
the same subject, a non-empty email address and the strict JSON Boolean
`email_verified: true`. Membership is keyed by a hash of `(issuer, subject)`,
not by email, so changing providers or matching email addresses never silently
links identities.

Required settings:

```bash
SONALOOP_OIDC_ISSUER=https://identity.example.com
SONALOOP_OIDC_CLIENT_ID=...
SONALOOP_OIDC_CLIENT_SECRET=...
SONALOOP_CLOUD_SECRET=...
SONALOOP_PROVISIONING_MODE=invite_only
```

Use `invite_only` for customer deployments. A successful login then creates no
workspace, owner membership or billing trial. `bootstrap` is intended for the
first account on a new self-hosted instance; `self_serve` creates a trial
workspace for each new identity.

## Provisioning a customer

An operator creates the workspace and grants their own verified,
issuer-qualified subject the initial owner role:

```bash
sonaloop-cloud workspace-create "Customer research" <operator-subject>
sonaloop-cloud workspace-plan <workspace-id> comp
```

`comp` is an explicitly entitled, no-charge workspace. It does not require a
Stripe checkout or subscription.

Owners can then create an invitation for one exact email address from **Cloud
→ Workspace** or the CLI:

```bash
sonaloop-cloud invite-mint <workspace-id> person@example.ch
sonaloop-cloud invites <workspace-id> --status active
sonaloop-cloud invite-revoke <invite-id>
```

The link expires after seven days, can be used once, and grants the non-admin
`workspace_user` product role, persisted as workspace `editor`. The URL contains
neither the address nor the role; its server-side record keeps the target email
digest, creator, expiry, status and redemption audit. Redemption requires the
same normalized, verified email returned by the identity provider. Domain-wide
joining and email-based auto-linking are deliberately unsupported.

When Clerk delivery is configured, the Workspace form also creates a Clerk
application invitation and sends the signup email. After the recipient verifies
the exact address, Sonaloop redeems the one-time workspace grant, activates that
workspace and opens its prepared Jobs view. No Stripe step is involved for a
`comp` workspace; the copyable one-time link remains the owner fallback if email
delivery fails or is ambiguous.

An owner who prepares several customer workspaces can activate one workspace and
choose **View as regular member**. This creates a signed, browser-session role
preview for that active workspace: research data and actions use the normal
`workspace_user` permissions, owner-only controls disappear, and a persistent
banner exits the preview. The membership row is never changed. Switching
workspaces, signing out, losing owner membership, or presenting a stale preview
cookie ends the preview fail-closed.

## Customer-facing onboarding surface

Shared Postgres row tenancy disables the Core product tour and the browser loader
for its bundled `onboarding-showcase` by default. A customer therefore opens the
workspace data prepared for them rather than an onboarding demo that could add
unrelated records. Local/single-user Core keeps the opt-in tour enabled by default;
MCP and CLI example loading remain explicit host-controlled operations. Set
`SONALOOP_PRODUCT_TOUR_ENABLED=1` only when a shared deployment deliberately wants
to expose that onboarding surface.

## Workspace-owned design system and branding

Each workspace may publish one active, versioned `workspace_design_system.v2`. It is structured data,
not arbitrary CSS: brand identity, light/dark color roles, approved font stacks/assets, spacing,
imagery, charts and export/deck choices pass the Core validator and the Cloud publish gate. Drafts do
not affect customer pages. Publishing switches the workspace pointer atomically; previous versions
remain auditable and can be rolled back. Owner permission is required for design-system and asset
writes.

The application resolves the published version per request from the authenticated **active
workspace**. Its name and logo replace the Sonaloop shell lockup; its safe tokens flow into the shell,
new prototypes and version-snapshotted HTML/PDF/PPTX exports. Missing or invalid branding falls back
to the Sonaloop default rather than breaking research. A path parameter or workspace cookie alone
cannot wear another tenant's theme: membership and the active row-tenancy scope are authoritative.

Brand artwork is never recolored by CSS. Supply the official positive/dark-on-light lockup as
`brand.logo_variants.lockup` (or the configured `logo_preferred`) and, where the brand provides one,
the official negative/light-on-dark artwork as `brand.logo_variants.lockup_dark`; `reversed` is the
fallback dark-scheme role. The shell swaps these assets for explicit light/dark mode and for the
browser's preferred scheme. If no negative variant exists, it keeps the positive asset rather than
inventing one.

Design assets are a separate workspace-owned library. Uploads are size- and MIME-bounded; logos
accept sanitized SVG or PNG, images accept PNG/JPEG/WebP, and fonts accept WOFF/WOFF2. Payloads refer
to immutable `workspace-asset:<id>@<hash>` values, never arbitrary filesystem paths or remote runtime
URLs. Publish validation resolves every reference in the same workspace and checks its expected kind.
At render/export time Cloud resolves bytes again under that workspace id and inlines or serves only
the authorized rendition. Archiving a library record does not delete bytes needed by an already
published historical version.

## Tenant and file boundary

Postgres row-level security and the request workspace scope protect structured
records. Every authenticated browser request binds exactly the active workspace
as its only read and write scope; other memberships remain switcher choices and
their projects, personas and evidence are not unioned into the active UI. Runtime
files live under:

```text
<SONALOOP_DATA_DIR>/workspaces/<workspace-id>/
```

This includes persona SOUL and memory files, avatars, assets, snapshots,
simulations, exports, prototypes and browser-session logs. In tenant mode,
external filesystem paths are rejected and unscoped `/data`, `/proto-files`
and `/sessions-files` routes do not expose runtime files. Images remain
available to authorized research agents through `view_asset`; browser previews
and downloads resolve an opaque asset id through an authenticated,
active-workspace-only route without reopening raw filesystem mounts. Persona
portraits use the same boundary at `GET /personas/<persona-id>/avatar`: the
persona is resolved under the active RLS scope, its PNG is contained inside that
workspace's avatar directory, and the response is `private, no-store`. Stable
catalog persona ids therefore cannot leak a portrait or a locally revised avatar
across a workspace switch. Fixed avatar and asset thumbnail routes repeat that
authorization before deriving bounded WebP pixels. Their caches live below the
active workspace partition; Cloud skips theme compilation for these exact binary
paths, while the outer session and RLS middleware still executes normally.

Static prototype previews use a short-lived signed route at
`GET /prototype-files/<capability>/<prototype-id>/<path>`. The authenticated detail
page mints the capability for exactly its active workspace and prototype tree. It is
not a session token and authorizes no app/API route. Each file request revalidates
the signature, expiry, live prototype row and registered directory inside that
workspace's prototype partition. The iframe is opaque and credentialless (no
`allow-same-origin`): relative CSS/JS/images/fetches work, while prototype code gets
no Sonaloop session/workspace cookies or parent/API access. Entry HTML is revalidated;
unchanged nested files get a bounded private cache. Missing, foreign, expired, forged,
dynamic-runner and escaping paths all return the same 404. The legacy unscoped
`/proto-files` mount remains unavailable in Cloud.

For a first customer rollout, keep command lifecycle hooks and the hosted-agent
worker disabled until their workflows and outbound actions have been reviewed:

```bash
SONALOOP_DISABLE_HOOKS=1
SONALOOP_CLOUD_AGENT_WORKER=0
```
