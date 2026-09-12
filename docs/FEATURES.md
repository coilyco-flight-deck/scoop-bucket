# Features

Baseline inventory of what `coilyco-flight-deck/scoop-bucket` ships today. Update when a manifest is added, removed, or materially reshaped.

## Manifests

Bucket installed via `scoop bucket add coilyco-flight-deck https://forgejo.coilysiren.me/coilyco-flight-deck/scoop-bucket`. Individual manifests installed with `scoop install coilyco-flight-deck/<name>`. Every manifest pulls a prebuilt `*-windows-<arch>.exe` from a Forgejo release and verifies it against the `.sha256` sidecar published beside it.

- **[bucket/umbra.json](../bucket/umbra.json)** - tracks `coilyco-flight-deck/umbra` releases. Generates guarded CLIs from KDL policy and committed API locks. Published as `specgen` through v0.191.0.
- **[bucket/agent-compose.json](../bucket/agent-compose.json)** - tracks `coilyco-flight-deck/agent-compose` releases. Core Roster context composition for native agent harnesses.
- **[bucket/aos.json](../bucket/aos.json)** - tracks `aos-v*` releases from `coilyco-flight-deck/agentic-os`. The agent runtime composition root.

The `o2r` manifest is gone, because its upstream `otel-a2a-relay-cli` is archived. The `ward` manifest is gone for the same reason: `coilyco-flight-deck/ward` is archived and no longer on this Forgejo, so every URL it carried returned 404.

## Autoupdate

[`scripts/autoupdate-sources.json`](../scripts/autoupdate-sources.json) names, per manifest, the `checkver` feed, the rendered `<tool>.json` upstream publishes, and that release's `SHA256SUMS`. It sits beside the script, not inside `bucket/*.json`, which keeps each manifest byte-identical to upstream's. No upstream here publishes `.sha256` sidecars any more.

- **[.forgejo/workflows/autoupdate.yml](../.forgejo/workflows/autoupdate.yml)** + **[scripts/update-manifests.mjs](../scripts/update-manifests.mjs)** - the hourly backstop behind the per-repo push. All three manifests are covered, so the job fetches the manifest upstream itself published at the newest usable release, checks it against that release's `SHA256SUMS`, and commits its bytes unchanged. It never re-derives a manifest. A gone feed, a regex matching no tag, and a manifest stuck behind three unusable releases are each reported with a non-zero exit rather than passing as current. This is the piece whose absence stuck `ward` at `0.353.0` ([scoop-bucket#1](https://forgejo.coilysiren.me/coilyco-flight-deck/scoop-bucket/issues/1)). See [docs/autoupdate.md](autoupdate.md) for the walkthrough.

Upstream-side contract:

- The producing repo's `release.yml` attaches the assets, a `SHA256SUMS` covering them, and the rendered `<tool>.json` manifest.
- The release tag is `v<semver>`.

## See also

- [README.md](../README.md) - human-facing intro and install steps.
- [AGENTS.md](../AGENTS.md) - agent-facing operating rules.
- [.ward/ward.yaml](../.ward/ward.yaml) - catalog metadata only.

Cross-reference convention from [coilysiren/agentic-os-kai#313](https://github.com/coilysiren/agentic-os-kai/issues/313).
