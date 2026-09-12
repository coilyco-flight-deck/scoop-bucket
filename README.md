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
scoop install coilyco-flight-deck/umbra
scoop install coilyco-flight-deck/agent-compose
scoop install coilyco-flight-deck/aos
```

Upgrade with `scoop update <name>`, or `scoop update *` for everything.

## What is in the bucket

- [`umbra`](bucket/umbra.json) - generates a standalone guarded CLI from
  KDL policy plus a committed lock. From
  [umbra](https://forgejo.coilysiren.me/coilyco-flight-deck/umbra). Installed as
  `specgen` before the driver took its framework's name.
- [`agent-compose`](bucket/agent-compose.json) - composes the role, doctrine,
  and skill context an agent harness loads. From
  [agent-compose](https://forgejo.coilysiren.me/coilyco-flight-deck/agent-compose).
- [`aos`](bucket/aos.json) - the agent runtime composition root. From
  [agentic-os](https://forgejo.coilysiren.me/coilyco-flight-deck/agentic-os).

Every manifest pulls a prebuilt `*-windows-<arch>.exe` from a Forgejo release
and verifies it against the `SHA256SUMS` published with that release.

## How a version bump lands here

Each upstream renders its own manifest and publishes it as a release asset, then
its release CI pushes that file into `bucket/`. That push is the normal path, and
the commits reading `chore(<tool>): bump manifest to vX.Y.Z [skip ci]` are it.

[`.forgejo/workflows/autoupdate.yml`](.forgejo/workflows/autoupdate.yml) is the
backstop for when that push stops. It runs
[`scripts/update-manifests.mjs`](scripts/update-manifests.mjs) hourly, which
follows the `checkver` feeds in
[`scripts/autoupdate-sources.json`](scripts/autoupdate-sources.json), fetches the
manifest **upstream itself published** at the newest complete release, checks it
against that release's `SHA256SUMS`, and commits its bytes unchanged. The bucket
receives upstream's manifest rather than re-deriving one, so the renderer stays
in the repo that owns the shape. See [docs/autoupdate.md](docs/autoupdate.md) and
[scoop-bucket#1](https://forgejo.coilysiren.me/coilyco-flight-deck/scoop-bucket/issues/1).

An upstream repo that wants a manifest here owes three things from its own
`release.yml`: attach the built assets plus a `SHA256SUMS` covering them, attach
the rendered `<tool>.json` manifest, and tag consistently so one regex selects
that train and no other.

## See also

- [AGENTS.md](AGENTS.md) - agent-facing operating rules.
- [docs/FEATURES.md](docs/FEATURES.md) - inventory of what ships today.
- [.ward/ward.yaml](.ward/ward.yaml) - catalog metadata only.

Cross-reference convention from [coilysiren/agentic-os#59](https://forgejo.coilysiren.me/coilyco-flight-deck/agentic-os/issues/59).
