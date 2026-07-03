# coilyco-flight-deck/scoop-bucket

Scoop bucket for Windows binaries published from `coilyco-flight-deck/*` repos. Sibling to the flight-deck Homebrew tap. Forgejo-canonical: both the bucket and the binaries it points at are hosted on `forgejo.coilysiren.me`.

## Install

```powershell
scoop bucket add flight-deck https://forgejo.coilysiren.me/coilyco-flight-deck/scoop-bucket
scoop install flight-deck/ward
```

## Update

```powershell
scoop update ward
```

## Manifests

- **`ward`** - [coilyco-flight-deck/ward](https://forgejo.coilysiren.me/coilyco-flight-deck/ward). The cli-guard consumer (audited dev + operator surface). Pulls the prebuilt `ward-windows-<arch>.exe` from each Forgejo release. This is the Windows install/upgrade channel `ward upgrade` drives via `scoop update ward` (ward#561).
- **`o2r`** - [coilyco-flight-deck/otel-a2a-relay-cli](https://forgejo.coilysiren.me/coilyco-flight-deck/otel-a2a-relay-cli). Operator CLI for Agent Channels and trust issuance. Pulls the prebuilt `o2r-windows-<arch>.exe` from each Forgejo release.

## How autoupdate works

Each manifest's `autoupdate` block points at `https://forgejo.coilysiren.me/coilyco-flight-deck/<repo>/releases/download/v$version/<asset>#/<rename>` and reads the SHA256 from the `.sha256` sidecar uploaded alongside the binary.

Landing those bumps back into the bucket is automated. `.forgejo/workflows/autoupdate.yml` runs `scripts/update-manifests.mjs` hourly, advances each manifest to the newest **complete** upstream release (one whose assets and `.sha256` sidecars all exist), and commits to `main`. Without that job the bucket never moves and `scoop update` keeps reporting the installed version as latest - see [docs/autoupdate.md](docs/autoupdate.md) and [scoop-bucket#1](https://forgejo.coilysiren.me/coilyco-flight-deck/scoop-bucket/issues/1).

Upstream-side contract:

- The producing repo's `.forgejo/workflows/release.yml` attaches `<asset>` and `<asset>.sha256` to the release.
- The release tag is `v<semver>`.

For `o2r` that wiring lives at [`coilyco-flight-deck/otel-a2a-relay-cli/.forgejo/workflows/release.yml`](https://forgejo.coilysiren.me/coilyco-flight-deck/otel-a2a-relay-cli/src/branch/main/.forgejo/workflows/release.yml) (the `assets` job, matrix over goos x goarch).

## See also

- [AGENTS.md](AGENTS.md) - agent-facing operating rules.
- [docs/FEATURES.md](docs/FEATURES.md) - inventory of what ships today.
- [.coily/coily.yaml](.coily/coily.yaml) - allowlisted commands.

Cross-reference convention from [coilysiren/agentic-os-kai#313](https://github.com/coilysiren/agentic-os-kai/issues/313).
