---
ward:
  workflow: merge-remote-main
---
# Agent instructions for `coilyco-flight-deck/scoop-bucket`

Orientation for fresh Claude / mobile sessions. Keep this short.

## Scope

The Scoop bucket for `coilyco-flight-deck/*` tools on Windows. Sibling to the flight-deck Homebrew tap. Each `bucket/*.json` manifest points at a release asset published from its upstream repo.

## Project shape

- `bucket/*.json` - Scoop manifests, one per published tool. Today: `ward`, `umbra`, `agent-compose`, `aos`.
- `README.md` - install steps and the upstream-side contract for autoupdate.
- `.forgejo/workflows/autoupdate.yml` and `scripts/update-manifests.mjs` - the hourly job that lands version bumps.

## Repo boundaries

This repo only hosts manifests. Source code for each tool lives in its own `coilyco-flight-deck/*` repo. Releases are produced upstream and consumed here.

## Commands

No dev verbs, so this repo ships no justfile. [`.ward/ward.yaml`](.ward/ward.yaml) carries catalog metadata only. The autoupdate job runs `scripts/update-manifests.mjs` in CI, not from a local verb.

## Validation

Pre-commit suite shipped from `coilysiren/agentic-os` enforces catalog and documentation discipline. Run with `pre-commit run --all-files`.

## Safety

Public repo, external-contributor audience. No LAN IPs, public IPs, addresses, real names, secondary email aliases, or private identity tags. Role-based descriptors only when referring to people in issues, PRs, commits, or docs.

- Do not hand-edit `version` or `hash` to race the release pipeline.
- Do not bypass commit hooks (`--no-verify`).
- Operator verbs route through `aosguard ops <area>`, never bare `gh`, `aws`, or `kubectl`. Enumerate an area with `aosguard ops <area> describe` rather than guessing a verb.

## Cross-repo contracts

The producing repo's `release.yml` must attach `<asset>` and `<asset>.sha256` to the release. The release tag must be `v<semver>`. Without those, `scoop update` cannot bump the manifest.

## Release

Upstream repos cut a tag. `scoop update` reads the manifest's `autoupdate` block, fetches the sidecar, and bumps `version` + `hash`.

## Agent rules

<!-- BEGIN managed by agentic-os/scripts/apply-git-workflow.py -->
### Git workflow

**This repo runs the `merge-remote-main` lane**, declared as `ward.workflow` in this file's frontmatter. The agent commits, pushes straight to `main`, and closes the issue. Pushing `main` here is the expected path, not an escalation.

The fleet runs two lanes, and both authorize the same core actions:

* `merge-remote-main` - the agent commits, pushes to `main`, and closes the issue. No branch and no pull request.
* `pull-request-and-merge` - the agent commits to a task branch, pushes it, opens a pull request, and merges that pull request itself once it is green.

**Every lane slug names what the AGENT does, never what someone else does.** `pull-request-and-merge` carries the merge because the agent that authored the code merges its own pull request. `pull-request` drops `-and-merge` because the author stops at the pull request and the director merge lane takes over. Reading `pull-request-and-merge` as "someone else merges it later" inverts the two lanes and leaves finished work sitting unmerged.

**These actions are pre-authorized on every lane, and the agent MUST take them without asking first.** Committing, creating a branch, pushing a branch, pushing the lane's own destination, and opening a pull request are ordinary reversible work, not the destructive wall that earns a question. Stopping to ask is how a turn ends with the work stranded in a dirty worktree.

* **ALWAYS commit** in-scope work and **ALWAYS push** it to the canonical remote before pausing, reporting a checkpoint, handing off, or ending a turn. A local-only commit is not a checkpoint.
* **ALWAYS open the pull request** in the same turn as the branch's first push, on every lane except `remote-branch-only`. A pushed branch with no pull request is litter nobody reviews.
* **NEVER `--no-verify`** and **NEVER force-push**. Those two are the real walls, and they stay closed.
* **ALWAYS merge your own pull request on `pull-request-and-merge`**, in the same turn, as soon as it is green. Reporting it as open and awaiting someone is the failure this lane exists to prevent.
* **NEVER merge on `pull-request` or `remote-branch-only`.** Those two stop where they stop, and the director merge lane carries a `pull-request` from there.
<!-- END managed by agentic-os/scripts/apply-git-workflow.py -->

Commit to `main`, push after each commit. Conventional commits and issue references are house style. The `closes-issue` and `conventional-commit` commit-msg hooks were retired from the catalog suite, so nothing enforces them here.

## Checkout residency

This repo is not in Agent Compose's `repository-plan.yaml`, so it has no
resident checkout under `~/projects/<owner>/`. That is intentional. Work it
from a task-scoped temporary clone, and remove that clone once the work lands.

A temporary root can be purged at any time, so commit and push before pausing,
switching tasks, or ending a session. The remote is the only durable artifact.

## See also

- [README.md](README.md) - human-facing intro.
- [docs/FEATURES.md](docs/FEATURES.md) - inventory of what ships today.
- [.ward/ward.yaml](.ward/ward.yaml) - catalog metadata only.

Cross-reference convention from [coilysiren/agentic-os-kai#313](https://github.com/coilysiren/agentic-os-kai/issues/313).
