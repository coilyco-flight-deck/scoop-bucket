# Features

Baseline inventory of what `coilyco-flight-deck/scoop-bucket` ships today. Update when a manifest is added, removed, or materially reshaped.

## Manifests

Bucket installed via `scoop bucket add flight-deck https://forgejo.coilysiren.me/coilyco-flight-deck/scoop-bucket`. Individual manifests installed with `scoop install flight-deck/<name>`.

- **[bucket/ward.json](../bucket/ward.json)** - tracks `coilyco-flight-deck/ward` Forgejo releases. Pulls `ward-windows-{amd64,arm64}.exe` (renamed `ward.exe`), each verified against its `.exe.sha256` sidecar. ward is the cli-guard consumer (audited dev + operator surface) and this is the primary Windows install/upgrade channel `ward upgrade` drives. See [ward#561](https://forgejo.coilysiren.me/coilyco-flight-deck/ward/issues/561).
- **[bucket/o2r.json](../bucket/o2r.json)** - tracks `coilyco-flight-deck/otel-a2a-relay-cli` Forgejo releases. Pulls the prebuilt `o2r-windows-<arch>.exe` from each tag. Operator CLI for Agent Channels and trust issuance.

## Autoupdate

Each manifest's `autoupdate` block points at `https://forgejo.coilysiren.me/coilyco-flight-deck/<repo>/releases/download/v$version/<asset>#/<rename>` and reads the SHA256 from the `.sha256` sidecar uploaded alongside the binary.

- **[.forgejo/workflows/autoupdate.yml](../.forgejo/workflows/autoupdate.yml)** + **[scripts/update-manifests.mjs](../scripts/update-manifests.mjs)** - the in-repo job that lands bumps. It runs hourly (and on `workflow_dispatch`), advances each manifest to the newest **complete** upstream release (skipping any tag whose assets or `.sha256` sidecars are missing), and commits to `main`. This is the piece whose absence stuck `ward` at `0.353.0` ([scoop-bucket#1](https://forgejo.coilysiren.me/coilyco-flight-deck/scoop-bucket/issues/1)). See [docs/autoupdate.md](autoupdate.md) for the walkthrough.

Upstream-side contract:

- The producing repo's `release.yml` attaches `<asset>` and `<asset>.sha256` to the release.
- The release tag is `v<semver>`.

## See also

- [README.md](../README.md) - human-facing intro and install steps.
- [AGENTS.md](../AGENTS.md) - agent-facing operating rules.
- [.coily/coily.yaml](../.coily/coily.yaml) - allowlisted commands.

Cross-reference convention from [coilysiren/agentic-os-kai#313](https://github.com/coilysiren/agentic-os-kai/issues/313).
