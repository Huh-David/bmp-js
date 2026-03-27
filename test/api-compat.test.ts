import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

import { decode, decodeRgb, decodeRgba, encode } from "../src/index";
import {
  decodeForSharp,
  encodeFromSharp,
  isBmp,
  sharpFromBmp,
  toSharpInput,
} from "../src/sharp/index";

const distEsm = resolve(process.cwd(), "dist/index.js");
const distCjs = resolve(process.cwd(), "dist/index.cjs");
const distSharpEsm = resolve(process.cwd(), "dist/sharp/index.js");
const distSharpCjs = resolve(process.cwd(), "dist/sharp/index.cjs");

describe("API compatibility", () => {
  it("keeps source exports stable", () => {
    expect(typeof decode).toBe("function");
    expect(typeof decodeRgba).toBe("function");
    expect(typeof decodeRgb).toBe("function");
    expect(typeof encode).toBe("function");
    expect(typeof isBmp).toBe("function");
    expect(typeof decodeForSharp).toBe("function");
    expect(typeof toSharpInput).toBe("function");
    expect(typeof sharpFromBmp).toBe("function");
    expect(typeof encodeFromSharp).toBe("function");
  });

  it.skipIf(!existsSync(distCjs))("supports CommonJS require from dist", () => {
    const require = createRequire(import.meta.url);
    const mod = require(distCjs);

    expect(typeof mod.decode).toBe("function");
    expect(typeof mod.decodeRgba).toBe("function");
    expect(typeof mod.decodeRgb).toBe("function");
    expect(typeof mod.encode).toBe("function");
  });

  it.skipIf(!existsSync(distEsm))("supports ESM import from dist", async () => {
    const mod = await import(pathToFileURL(distEsm).href);

    expect(typeof mod.decode).toBe("function");
    expect(typeof mod.decodeRgba).toBe("function");
    expect(typeof mod.decodeRgb).toBe("function");
    expect(typeof mod.encode).toBe("function");
    expect(typeof mod.default.decodeRgba).toBe("function");
    expect(typeof mod.default.decodeRgb).toBe("function");
    expect(typeof mod.default.decode).toBe("function");
    expect(typeof mod.default.encode).toBe("function");
  });

  it.skipIf(!existsSync(distSharpCjs))("supports CommonJS require for sharp subexport", () => {
    const require = createRequire(import.meta.url);
    const mod = require(distSharpCjs);

    expect(typeof mod.isBmp).toBe("function");
    expect(typeof mod.decodeForSharp).toBe("function");
    expect(typeof mod.toSharpInput).toBe("function");
    expect(typeof mod.sharpFromBmp).toBe("function");
    expect(typeof mod.encodeFromSharp).toBe("function");
  });

  it.skipIf(!existsSync(distSharpEsm))("supports ESM import for sharp subexport", async () => {
    const mod = await import(pathToFileURL(distSharpEsm).href);

    expect(typeof mod.isBmp).toBe("function");
    expect(typeof mod.decodeForSharp).toBe("function");
    expect(typeof mod.toSharpInput).toBe("function");
    expect(typeof mod.sharpFromBmp).toBe("function");
    expect(typeof mod.encodeFromSharp).toBe("function");
  });
});
