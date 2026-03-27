import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const FIXTURES_DIR = join(ROOT, "fixtures");
const SOURCES_PATH = join(ROOT, "docs", "test-fixture-sources.json");
const PROVENANCE_PATH = join(ROOT, "docs", "fixture-provenance.json");

const SAFE_LICENSE_STATUSES = new Set(["safe_to_vendor", "safe_to_vendor_with_exclusions"]);

function normalizePath(filePath) {
  return filePath.split(sep).join("/");
}

function walkBmpFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkBmpFiles(full, acc);
      continue;
    }
    if (entry.toLowerCase().endsWith(".bmp")) {
      acc.push(normalizePath(relative(ROOT, full)));
    }
  }

  return acc;
}

function fail(message) {
  console.error(`fixture provenance check failed: ${message}`);
  process.exitCode = 1;
}

const sources = JSON.parse(readFileSync(SOURCES_PATH, "utf8"));
const provenance = JSON.parse(readFileSync(PROVENANCE_PATH, "utf8"));

const sourceById = new Map();
for (const source of sources) {
  sourceById.set(source.id, source);
}

const manifestByPath = new Map();
for (const entry of provenance) {
  if (manifestByPath.has(entry.path)) {
    fail(`duplicate provenance entry for ${entry.path}`);
    continue;
  }
  manifestByPath.set(entry.path, entry);
}

const fixtureFiles = walkBmpFiles(FIXTURES_DIR).sort();
for (const filePath of fixtureFiles) {
  const entry = manifestByPath.get(filePath);
  if (!entry) {
    fail(`missing provenance entry for ${filePath}`);
    continue;
  }

  const source = sourceById.get(entry.sourceId);
  if (!source) {
    fail(`unknown sourceId "${entry.sourceId}" for ${filePath}`);
    continue;
  }

  if (filePath.startsWith("fixtures/third-party/")) {
    if (!SAFE_LICENSE_STATUSES.has(source.license_status)) {
      fail(
        `third-party fixture ${filePath} references source "${entry.sourceId}" with unsafe status "${source.license_status}"`,
      );
    }
  }
}

for (const [filePath] of manifestByPath) {
  if (!fixtureFiles.includes(filePath)) {
    fail(`provenance entry points to missing file: ${filePath}`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`fixture provenance OK (${fixtureFiles.length} .bmp files)`);
