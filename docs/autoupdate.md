# Autoupdate automation

How an upstream release becomes a bumped manifest, with no human running `scoop update`.

## The problem this closes

`scoop update <app>` compares the installed version to the manifest without
re-deriving it from upstream, so if nothing rewrites `bucket/*.json` every client
calls its pinned version "latest" forever. That is how `ward` sat at `0.353.0`
(scoop-bucket#1).

## Push is the normal path, this job is the backstop

Each upstream renders its own manifest, publishes it as a release asset, and its
release CI pushes that file here. The hourly job exists for when that push stops
without anyone noticing. [`update-manifests.mjs`](../scripts/update-manifests.mjs)
reads [`autoupdate-sources.json`](../scripts/autoupdate-sources.json), follows
each `checkver` feed, and writes upstream's manifest **bytes** at the newest
usable release. It re-derives nothing: a second renderer would drift from the
repo owning the shape, and keeping that pull config beside the script rather than
inside `bucket/*.json` is what keeps each manifest byte-identical to upstream's.
The checkout pins `ref: main`: a schedule runs at the sha it registered on, and
`[skip ci]` bumps never re-register it (hourly rejected pushes from 2026-09-12).

## What makes a release usable

The manifest asset must parse, its `version` must equal its tag, and every asset
named in it that `SHA256SUMS` covers must carry the digest upstream vouches for,
reaching the `pre_install` hashes `aos` keeps outside `architecture`. One release
failing that is one still uploading, so the bucket lags a cycle. Three in a row is
a broken upstream, reported with a non-zero exit.

Quiet failures get the same treatment: a deleted upstream 404s its feed and a
`checkver` regex can match nothing, both named rather than read as current.
`agentic-os` runs three trains through one feed, so `aos.json` anchors to `aos-v`.

## See also

- [README.md](../README.md) - human-facing intro and install steps.
- [FEATURES.md](FEATURES.md) - inventory of what ships today.
