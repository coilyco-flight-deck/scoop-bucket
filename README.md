# scoop-bucket

The Scoop bucket for every `coilyco-flight-deck` CLI on Windows. Sibling to the
flight-deck [Homebrew tap](https://forgejo.coilysiren.me/coilyco-flight-deck/homebrew-tap),
which serves the same tools on macOS and Linux.

Forgejo is canonical here. Both the bucket and the binaries it points at are
hosted on `forgejo.coilysiren.me`.

## Install

```powershell
scoop bucket add coilyco-flight-deck https://forgejo.coilysiren.me/coilyco-flight-deck/scoop-bucket
```

Then install whichever tools you want:

```powershell
scoop install coilyco-flight-deck/ward
scoop install coilyco-flight-deck/specgen
scoop install coilyco-flight-deck/agent-compose
scoop install coilyco-flight-deck/aos
```

Upgrade with `scoop update <name>`, or `scoop update *` for everything.

## What is in the bucket

- [`ward`](bucket/ward.json) - governed execution layer for coding agents, and
  the audited verb gate contributors route build, test, and lint through. This
  is the Windows channel `ward upgrade` drives. From
  [ward](https://forgejo.coilysiren.me/coilyco-flight-deck/ward).
- [`specgen`](bucket/specgen.json) - generates a standalone guarded CLI from
  KDL policy plus a committed lock. From
  [umbra](https://forgejo.coilysiren.me/coilyco-flight-deck/umbra).
- [`agent-compose`](bucket/agent-compose.json) - composes the role, doctrine,
  and skill context an agent harness loads. From
  [agent-compose](https://forgejo.coilysiren.me/coilyco-flight-deck/agent-compose).
- [`aos`](bucket/aos.json) - the agent runtime composition root. From
  [agentic-os](https://forgejo.coilysiren.me/coilyco-flight-deck/agentic-os).

Every manifest pulls a prebuilt `*-windows-<arch>.exe` from a Forgejo release
and verifies it against the `.sha256` sidecar published beside it.

## How a version bump lands here

Each manifest's `autoupdate` block points at
`https://forgejo.coilysiren.me/coilyco-flight-deck/<repo>/releases/download/v$version/<asset>#/<rename>`
and reads the checksum from the sidecar.

Landing those bumps is automated in this repo.
[`.forgejo/workflows/autoupdate.yml`](.forgejo/workflows/autoupdate.yml) runs
[`scripts/update-manifests.mjs`](scripts/update-manifests.mjs) hourly, advances
each manifest to the newest **complete** upstream release, and commits to
`main`. Complete means every asset and every `.sha256` sidecar exists, so a
half-published tag is skipped rather than pinned. Without that job the bucket
never moves and `scoop update` keeps reporting the installed version as the
latest. See [docs/autoupdate.md](docs/autoupdate.md) and
[scoop-bucket#1](https://forgejo.coilysiren.me/coilyco-flight-deck/scoop-bucket/issues/1).

An upstream repo that wants a manifest here owes two things from its own
`release.yml`: attach both `<asset>` and `<asset>.sha256` to the release, and
tag as `v<semver>`.

## See also

- [AGENTS.md](AGENTS.md) - agent-facing operating rules.
- [docs/FEATURES.md](docs/FEATURES.md) - inventory of what ships today.
- [.ward/ward.yaml](.ward/ward.yaml) - catalog metadata only.

Cross-reference convention from [coilysiren/agentic-os#59](https://forgejo.coilysiren.me/coilyco-flight-deck/agentic-os/issues/59).
