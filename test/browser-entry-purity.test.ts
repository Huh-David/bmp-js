import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The main entry is advertised as browser-safe. Bundlers that polyfill Node
 * builtins (Next.js/Turbopack ships a `url` polyfill with no `fileURLToPath`)
 * crash at module evaluation if any Node import reaches this graph, so the
 * guarantee has to be asserted against the *built* output rather than `src`.
 *
 * Regression test for tsup's `shims: true`, which injected an eager
 * `fileURLToPath(import.meta.url)` into the chunk shared with the sharp entry
 * and broke `import { decode } from "@huh-david/bmp-js"` on its own.
 */
const distDir = resolve(process.cwd(), "dist");
const mainEsm = resolve(distDir, "index.js");
const mainCjs = resolve(distDir, "index.cjs");

/**
 * Matches every way a local chunk can be pulled in: `from "./x"`, bare
 * side-effect `import "./x"`, `import("./x")`, and `require("./x")`, in either
 * quote style. Deliberately broader than esbuild's current output so the crawl
 * cannot silently miss a Node builtin if that output shape ever changes.
 */
const LOCAL_EDGE = /(?:from|import|require)\s*\(?\s*["'](\.[^"']*)["']/g;

/** Collects an entry plus every local chunk it transitively pulls in. */
function collectEntryGraph(entry: string): { file: string; source: string }[] {
  const seen = new Set<string>();
  const graph: { file: string; source: string }[] = [];
  const queue = [entry];

  while (queue.length > 0) {
    const file = queue.pop() as string;

    if (seen.has(file) || !existsSync(file)) {
      continue;
    }

    seen.add(file);
    const source = readFileSync(file, "utf8");
    graph.push({ file, source });

    for (const match of source.matchAll(LOCAL_EDGE)) {
      const specifier = match[1] as string;
      queue.push(resolve(dirname(file), specifier));
    }
  }

  return graph;
}

describe.each([
  // The ESM entry is the one that regressed: only it is code-split, so only it
  // can inherit a shim from the chunk shared with the sharp entry.
  { format: "esm", entry: mainEsm, chunked: true },
  // The CJS entry is bundled standalone, so it has no chunk edges to follow.
  { format: "cjs", entry: mainCjs, chunked: false },
])("browser-safe main entry ($format)", ({ entry, chunked }) => {
  const graph = existsSync(entry) ? collectEntryGraph(entry) : [];

  it.skipIf(!existsSync(entry) || !chunked)("crawls beyond the entry itself", () => {
    // Guards the test: a broken crawler would vacuously pass every assertion.
    expect(graph.length).toBeGreaterThan(1);
  });

  it
    .skipIf(!existsSync(entry))
    .each(["node:url", "node:module", "node:path", "node:fs", "node:process"])(
    "does not reference %s",
    (builtin) => {
      // Quote-agnostic: catches `from`, `require(...)`, and dynamic `import(...)`.
      const offenders = graph.filter(
        ({ source }) => source.includes(`"${builtin}"`) || source.includes(`'${builtin}'`),
      );
      expect(offenders.map(({ file }) => file)).toEqual([]);
    },
  );

  it.skipIf(!existsSync(entry)).each(["url", "module", "path", "fs"])(
    "does not import bare %s",
    (builtin) => {
      const offenders = graph.filter(({ source }) =>
        new RegExp(`(?:from|require\\s*\\(|import\\s*\\()\\s*["']${builtin}["']`).test(source),
      );
      expect(offenders.map(({ file }) => file)).toEqual([]);
    },
  );

  it.skipIf(!existsSync(entry))(
    "never references fileURLToPath, createRequire, or __filename",
    () => {
      const offenders = graph.filter(({ source }) =>
        /fileURLToPath|createRequire|__filename|__dirname/.test(source),
      );
      expect(offenders.map(({ file }) => file)).toEqual([]);
    },
  );
});
