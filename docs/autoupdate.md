# Autoupdate automation

How a new upstream release becomes a bumped manifest in this bucket, without a
human running `scoop update` on a Windows box.

## The problem this closes

`scoop update <app>` on a user's machine only pulls the latest **bucket** commit
and compares the installed version to the manifest. It does not re-derive the
manifest from upstream. So if nothing ever rewrites `bucket/*.json`, the manifest
stays pinned and every client reports the installed version as "latest" even
after upstream has cut newer releases. That is exactly how `ward` sat at
`0.353.0` (scoop-bucket#1).

## The pieces

- **[`scripts/update-manifests.mjs`](../scripts/update-manifests.mjs)** - a
  dependency-free Node script that walks every `bucket/*.json`, reads its
  `checkver` feed and `autoupdate` templates, and rewrites `version` + per-arch
  `url` + `hash` in place. It is the portable-to-Linux equivalent of scoop's own
  autoupdate.
- **[`.forgejo/workflows/autoupdate.yml`](../.forgejo/workflows/autoupdate.yml)** -
  runs the script hourly (and on `workflow_dispatch`), then commits any bump
  straight to `main` with the auto-issued job token.

## Newest *complete* release, not newest tag

An upstream release can tag but publish no binaries when its release CI flakes.
Pointing a manifest at such a tag yields a 404 on install. So the script walks
candidate versions newest-first and picks the newest one whose every arch asset
**and** its `.sha256` sidecar resolve. A tag missing assets is skipped, not
pinned. When upstream backfills the assets, the next run advances to it.

This means the bucket can lag a freshly-cut tag by one automation cycle while
that release finishes uploading, which is the safe direction to fail.

## Running it by hand

```bash
node scripts/update-manifests.mjs
```

Prints one line per manifest (`ward.json: 0.353.0 -> 0.359.0`, or a skip note for
an incomplete upstream release) and rewrites only the manifests that moved.

## Upstream-side contract

Unchanged from the bucket's original contract - the producing repo's
`.forgejo/workflows/release.yml` must attach `<asset>` and `<asset>.sha256` to a
`v<semver>` release. Without the sidecar the script treats the release as
incomplete and holds the manifest at its current version.

## See also

- [README.md](../README.md) - human-facing intro and install steps.
- [FEATURES.md](FEATURES.md) - inventory of what ships today.
