import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { decode, encode } from "../src/index";

const distEsm = resolve(process.cwd(), "dist/index.js");
const distCjs = resolve(process.cwd(), "dist/index.cjs");

describe("API compatibility", () => {
  it("keeps source exports stable", () => {
    expect(typeof decode).toBe("function");
    expect(typeof encode).toBe("function");
  });

  it.skipIf(!existsSync(distCjs))("supports CommonJS require from dist", () => {
    const require = createRequire(import.meta.url);
    const mod = require(distCjs);

    expect(typeof mod.decode).toBe("function");
    expect(typeof mod.encode).toBe("function");
  });

  it.skipIf(!existsSync(distEsm))("supports ESM import from dist", async () => {
    const mod = await import(pathToFileURL(distEsm).href);

    expect(typeof mod.decode).toBe("function");
    expect(typeof mod.encode).toBe("function");
    expect(typeof mod.default.decode).toBe("function");
    expect(typeof mod.default.encode).toBe("function");
  });
});
