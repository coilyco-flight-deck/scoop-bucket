#!/usr/bin/env bash
# Land whatever update-manifests.mjs changed under bucket/, or exit quietly when
# it changed nothing. Its own file because a workflow `run` carries one line.
set -euo pipefail

if git diff --quiet -- bucket; then
  echo "No manifest changes to land."
  exit 0
fi

git config user.name "coilyco-ops"
git config user.email "coilyco-ops@noreply.forgejo.coilysiren.me"
git add bucket
# Autoupdate bumps close no issue; the commit-msg closes-issue hook is a
# client-side pre-commit hook and is not installed on the runner.
git commit -m "chore(autoupdate): advance manifests to newest complete releases"
git push origin HEAD:main
