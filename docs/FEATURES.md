# Features

Baseline inventory of what `coilyco-flight-deck/scoop-bucket` ships today. Update when a manifest is added, removed, or materially reshaped.

## Manifests

Bucket installed via `scoop bucket add flight-deck https://forgejo.coilysiren.me/coilyco-flight-deck/scoop-bucket`. Individual manifests installed with `scoop install flight-deck/<name>`.

- **[bucket/o2r.json](../bucket/o2r.json)** - tracks `coilyco-flight-deck/otel-a2a-relay-cli` Forgejo releases. Pulls the prebuilt `o2r-windows-<arch>.exe` from each tag. Operator CLI for Agent Channels and trust issuance.

## Autoupdate

Each manifest's `autoupdate` block points at `https://forgejo.coilysiren.me/coilyco-flight-deck/<repo>/releases/download/v$version/<asset>#/<rename>` and reads the SHA256 from the `.sha256` sidecar uploaded alongside the binary. `scoop bucket update` walks the bucket and bumps any manifest whose upstream `checkver` matches.

Upstream-side contract:

- The producing repo's `release.yml` attaches `<asset>` and `<asset>.sha256` to the release.
- The release tag is `v<semver>`.

## See also

- [README.md](../README.md) - human-facing intro and install steps.
- [AGENTS.md](../AGENTS.md) - agent-facing operating rules.
- [.coily/coily.yaml](../.coily/coily.yaml) - allowlisted commands.

Cross-reference convention from [coilysiren/agentic-os-kai#313](https://github.com/coilysiren/agentic-os-kai/issues/313).
