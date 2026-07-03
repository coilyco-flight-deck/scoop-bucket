#!/usr/bin/env node
// Advance each bucket/*.json to the newest upstream release whose assets and
// .sha256 sidecars all exist. Portable scoop-autoupdate. See docs/autoupdate.md.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const BUCKET = join(HERE, "..", "bucket");
const MAX_LOOKBACK = 40; // probe at most this many recent tags per manifest

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": "scoop-bucket-autoupdate" } });
  if (!res.ok) return null;
  return await res.text();
}

// Numeric semver compare on the dotted digits scoop's checkver regex captures.
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
  if (feed === null) throw new Error(`checkver feed unreachable: ${checkver.url}`);
  const re = new RegExp(checkver.regex, "g");
  const seen = [];
  let m;
  while ((m = re.exec(feed)) !== null) {
    if (m[1] && !seen.includes(m[1])) seen.push(m[1]);
  }
  seen.sort((a, b) => cmpVersion(b, a));
  return seen.slice(0, MAX_LOOKBACK);
}

// Resolve per-arch url + hash, or null if any asset/sidecar is missing. The
// manifest url keeps scoop's `#/rename`; the sidecar hangs off the clean url.
async function resolve(autoupdate, version) {
  const out = {};
  for (const [arch, spec] of Object.entries(autoupdate.architecture)) {
    const manifestUrl = spec.url.replaceAll("$version", version);
    const cleanUrl = manifestUrl.split("#/")[0];
    const hashUrl = spec.hash.url.replaceAll("$url", cleanUrl);
    const body = await fetchText(hashUrl);
    if (body === null) return null;
    const digest = (body.match(/[A-Fa-f0-9]{64}/) || [])[0];
    if (!digest) return null;
    out[arch] = { url: manifestUrl, hash: digest.toLowerCase() };
  }
  return out;
}

function serialize(obj) {
  return JSON.stringify(obj, null, 4) + "\n";
}

const changed = [];
for (const file of readdirSync(BUCKET).filter((f) => f.endsWith(".json")).sort()) {
  const path = join(BUCKET, file);
  const data = JSON.parse(readFileSync(path, "utf8"));
  if (!data.autoupdate || !data.checkver) continue;

  const current = data.version;
  const versions = await candidateVersions(data.checkver);
  let applied = null;
  for (const v of versions) {
    if (cmpVersion(v, current) <= 0) break; // caught up; nothing newer remains
    const resolved = await resolve(data.autoupdate, v);
    if (!resolved) {
      console.log(`  ${file}: v${v} skipped (assets/sidecars missing upstream)`);
      continue;
    }
    data.version = v;
    for (const [arch, { url, hash }] of Object.entries(resolved)) {
      data.architecture[arch].url = url;
      data.architecture[arch].hash = hash;
    }
    writeFileSync(path, serialize(data));
    applied = v;
    break;
  }

  if (applied) {
    console.log(`${file}: ${current} -> ${applied}`);
    changed.push(`${file} ${current} -> ${applied}`);
  } else {
    console.log(`${file}: ${current} (already newest complete release)`);
  }
}

if (changed.length === 0) console.log("No manifests advanced.");
