# Cloud GitHub Automations

Sonaloop Cloud can run persona-grounded automations from GitHub pull requests,
issues, comment commands and deployment previews. The integration is a GitHub
App: the installation is the repository permission boundary, Cloud maps each
installation/repository to one workspace, and writebacks use short-lived
installation tokens.

## Setup

Configure the Cloud deployment with:

| Variable | Purpose |
|---|---|
| `SONALOOP_GITHUB_APP_ID` | GitHub App id for signing app JWTs |
| `SONALOOP_GITHUB_APP_SLUG` | App slug used for the install link on `/cloud/workspace/github` |
| `SONALOOP_GITHUB_PRIVATE_KEY` or `SONALOOP_GITHUB_PRIVATE_KEY_PATH` | GitHub App private key |
| `SONALOOP_GITHUB_WEBHOOK_SECRET` | HMAC secret for webhook delivery validation |
| `SONALOOP_CLOUD_PUBLIC_URL` | Public Cloud URL used in setup copy and Check Run detail links |

GitHub App URLs:

- Webhook URL: `<cloud-public-url>/api/cloud/github/webhook`
- Setup callback URL: `<cloud-public-url>/cloud/github/setup`
- Workspace settings: `/cloud/workspace/github`

Subscribe the app to these events:

- `pull_request`
- `issues`
- `issue_comment`
- `deployment_status`
- `check_run`
- `installation`
- `installation_repositories`

Recommended permissions:

- Metadata: read
- Checks: read/write
- Issues: read/write
- Pull requests: read/write
- Deployments: read
- Contents: write only when Patch PR/autofix is enabled

## Runtime Flow

1. GitHub sends a signed webhook to Cloud.
2. Cloud validates `X-Hub-Signature-256` and dedupes by delivery id.
3. Cloud resolves `installation_id + repository_id` to one workspace and repo.
4. Repo rules decide whether to run a PR reaction gate, issue concept intake,
   comment command or check rerun.
5. PR runs create a `Sonaloop Reaction Test` Check Run early.
6. Deployment-status events store preview URLs by repository and head SHA.
7. The built-in `github.reaction_test` Automation runs a hosted Sonaloop agent.
8. The GitHub writeback node translates the outcome into Check Run updates,
   sticky comments, labels and, when explicitly enabled, Patch PRs.

If a repo requires a preview URL and no ready preview exists yet, Cloud completes
the Check Run as neutral with an actionable setup message instead of running a
weak reaction test.

## Result And Delivery Schemas

The GitHub connector does not make GitHub-specific payloads the primary research
result. The Automation returns normal, portable result schemas:

- `stimulus_reaction.v1`: persona sentiment, objections, supporting/skeptical
  segments and mockup direction.
- `threshold_gate.v1`: metric, threshold, observed value and pass/fail state.

The connector then records GitHub delivery payloads:

- `github_check_run.v1`
- `github_sticky_comment.v1`
- `github_pr_review.v1`
- `github_label_update.v1`
- `github_patch_pr.v1`

Patch PR delivery is disabled by default. It only runs when the repository has
autofix enabled and the agent returns structured files in `github_patch_pr.v1`
or `patch_pr`. The default path creates a separate Sonaloop branch and PR; it
does not mutate the original branch.
