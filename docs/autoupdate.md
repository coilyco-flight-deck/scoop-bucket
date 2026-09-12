# Autoupdate automation

How an upstream release becomes a bumped manifest here, with no human running
`scoop update` on a Windows box.

## The problem this closes

`scoop update <app>` compares the installed version to the manifest without
re-deriving it from upstream. So if nothing rewrites `bucket/*.json` every client
calls its pinned version "latest" long after upstream cut newer releases. That is
how `ward` sat at `0.353.0` (scoop-bucket#1).

## The pieces

[`scripts/update-manifests.mjs`](../scripts/update-manifests.mjs) walks every
`bucket/*.json`, reads its `checkver` feed and `autoupdate` templates, and
rewrites `version`, per-arch `url`, and `hash` in place. Dependency-free Node,
the portable-to-Linux equivalent of scoop's own autoupdate, run hourly and on
dispatch by [`autoupdate.yml`](../.forgejo/workflows/autoupdate.yml).

## Newest complete release, not newest tag

The upstream contract is that a producing repo attaches `<asset>` and
`<asset>.sha256` to a `v<semver>` release. A release can tag but publish no
binaries when its release CI flakes, and pointing a manifest there yields a 404
on install. So the script picks the newest candidate whose every arch asset
**and** `.sha256` sidecar resolve, lagging a tag by a cycle rather than pinning
an incomplete one.

An archived or deleted upstream is the other shape: its `releases.atom` 404s
forever. That manifest is reported and skipped, the rest still advance, and the
run still exits non-zero. Aborting the batch is how `ward` took the job down for
ten days (scoop-bucket#1697).

## See also

- [README.md](../README.md) - human-facing intro and install steps.
- [FEATURES.md](FEATURES.md) - inventory of what ships today.
