#!/usr/bin/env node
// Advance each bucket/*.json to the manifest upstream published at its newest
// usable release. Portable scoop-autoupdate. See docs/autoupdate.md.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const BUCKET = join(HERE, "..", "bucket");
const SOURCES = join(HERE, "autoupdate-sources.json");
const MAX_LOOKBACK = 40; // probe at most this many recent tags per manifest
// One newer release skipped is a release still uploading. Several in a row is a
// broken upstream, so stop probing and say so rather than walking back a year.
const SKIP_ALARM = 3;

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "scoop-bucket-autoupdate" } });
  if (!res.ok) return null;
  return await res.text();
}

// A 404 on the feed means the upstream repo is gone, not that the network blinked.
async function feedStatus(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "scoop-bucket-autoupdate" } });
    return res.status;
  } catch {
    return 0;
  }
}

// Numeric semver compare on the dotted digits the checkver regex captures.
function cmpVersion(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

// Read the checkver feed and return matching versions, newest first.
async function candidateVersions(checkver) {
  const feed = await fetchText(checkver.url);
  if (feed === null) return null;
  const re = new RegExp(checkver.regex, "g");
  const seen = [];
  let m;
  while ((m = re.exec(feed)) !== null) {
    if (m[1] && !seen.includes(m[1])) seen.push(m[1]);
  }
  seen.sort((a, b) => cmpVersion(b, a));
  return seen.slice(0, MAX_LOOKBACK);
}

// Return upstream's own manifest bytes, or null when the release is not usable.
// Bytes rather than a re-serialization, so formatting never drifts from upstream.
async function usableManifest(source, version) {
  const body = await fetchText(source.manifest.replaceAll("$version", version));
  if (body === null) return null;
  let parsed;
  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }
  if (parsed.version !== version) return null; // asset disagrees with its own tag

  const sums = await fetchText(source.sums.replaceAll("$version", version));
  if (sums === null) return null;

  // Every asset the manifest names must carry the digest upstream vouches for,
  // including the pre_install hashes that sit outside `architecture`.
  const lower = body.toLowerCase();
  let vouched = 0;
  for (const line of sums.split("\n")) {
    const [digest, name] = line.trim().split(/\s+/);
    if (!digest || !name || !lower.includes(name.toLowerCase())) continue;
    if (!lower.includes(digest.toLowerCase())) return null; // still uploading, or inconsistent
    vouched++;
  }
  if (vouched === 0) return null; // nothing vouched for; never land a manifest blind
  return body;
}

const sources = JSON.parse(readFileSync(SOURCES, "utf8"));
const changed = [];
const broken = [];

for (const file of Object.keys(sources).sort()) {
  const source = sources[file];
  const path = join(BUCKET, file);
  const current = JSON.parse(readFileSync(path, "utf8")).version;

  const versions = await candidateVersions(source.checkver);
  if (versions === null) {
    const status = await feedStatus(source.checkver.url);
    const why = status === 404 ? "gone (404)" : `unreadable (status ${status || "no response"})`;
    console.log(`${file}: checkver feed ${why}: ${source.checkver.url}`);
    broken.push(`${file} feed ${why}`);
    continue; // one dead upstream must not strand every other manifest
  }
  if (versions.length === 0) {
    // A regex matching nothing looks identical to "already current" otherwise.
    console.log(`${file}: checkver regex matched no tag in ${source.checkver.url}`);
    broken.push(`${file} regex matched no tag`);
    continue;
  }

  let applied = null;
  let skipped = 0;
  for (const v of versions) {
    if (cmpVersion(v, current) <= 0) break; // caught up; nothing newer remains
    const body = await usableManifest(source, v);
    if (body === null) {
      console.log(`  ${file}: v${v} skipped (manifest or SHA256SUMS incomplete upstream)`);
      if (++skipped >= SKIP_ALARM) break;
      continue;
    }
    writeFileSync(path, body);
    applied = v;
    break;
  }

  if (applied) {
    console.log(`${file}: ${current} -> ${applied}`);
    changed.push(`${file} ${current} -> ${applied}`);
  } else if (skipped >= SKIP_ALARM) {
    // Behind, and every newer release failed its check. Passing here is the
    // silent rot this job exists to catch.
    console.log(`${file}: ${current}, stuck behind ${skipped} unusable releases`);
    broken.push(`${file} stuck behind ${skipped} unusable releases`);
  } else if (skipped > 0) {
    console.log(`${file}: ${current} (newest release still uploading, retry next cycle)`);
  } else {
    console.log(`${file}: ${current} (already newest complete release)`);
  }
}

if (changed.length === 0) console.log("No manifests advanced.");

if (broken.length > 0) {
  console.error(`\n${broken.length} manifest(s) could not be checked:`);
  for (const b of broken) console.error(`  ${b}`);
  process.exitCode = 1;
}
