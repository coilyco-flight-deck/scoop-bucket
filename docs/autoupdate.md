# Autoupdate automation

How an upstream release becomes a bumped manifest here, with no human running
`scoop update` on a Windows box.

## The problem this closes

`scoop update <app>` pulls the latest bucket commit and compares the installed
version to the manifest, without re-deriving it from upstream. So if nothing
rewrites `bucket/*.json` the manifest stays pinned and every client reports its
installed version as "latest" long after upstream cut newer releases. That is
how `ward` sat at `0.353.0` (scoop-bucket#1).

## The pieces

[`scripts/update-manifests.mjs`](../scripts/update-manifests.mjs) walks every
`bucket/*.json`, reads its `checkver` feed and `autoupdate` templates, and
rewrites `version`, per-arch `url`, and `hash` in place. Dependency-free Node,
the portable-to-Linux equivalent of scoop's own autoupdate.
[`autoupdate.yml`](../.forgejo/workflows/autoupdate.yml) runs it hourly and on
dispatch, committing any bump straight to `main`. Run by hand,
`node scripts/update-manifests.mjs` prints one line per manifest and rewrites
only what moved.

## Newest complete release, not newest tag

An upstream release can tag but publish no binaries when its release CI flakes,
and pointing a manifest there yields a 404 on install. So the script walks
candidates newest-first and picks the newest whose every arch asset **and** its
`.sha256` sidecar resolve, skipping rather than pinning a tag missing assets.
The bucket can lag a fresh tag by one cycle while that release finishes
uploading, which is the safe direction to fail.

## The upstream contract

The producing repo attaches `<asset>` and `<asset>.sha256` to a `v<semver>`
release. Without the sidecar the script holds the manifest where it is.

## See also

- [README.md](../README.md) - human-facing intro and install steps.
- [FEATURES.md](FEATURES.md) - inventory of what ships today.
