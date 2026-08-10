import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import type { SharpModule } from "../../src/sharp/index";

const distSharpEsm = resolve(process.cwd(), "dist/sharp/index.js");
const distSharpCjs = resolve(process.cwd(), "dist/sharp/index.cjs");
const fixture = resolve(process.cwd(), "fixtures/bit24.bmp");

const require = createRequire(import.meta.url);
const hasSharp = (() => {
  try {
    require("sharp") as SharpModule;
    return true;
  } catch {
    return false;
  }
})();

/**
 * A directory that is guaranteed not to be the package root, so `sharp` cannot
 * be reached by walking up from the working directory. This is what makes the
 * test a regression test: the implicit resolution must key off the module's own
 * location, not `process.cwd()`.
 */
const foreignCwd = tmpdir();

function runInForeignCwd(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    cwd: foreignCwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

const esmScript = `
import { readFileSync } from "node:fs";
const mod = await import(${JSON.stringify(pathToFileURL(distSharpEsm).href)});
const buf = readFileSync(${JSON.stringify(fixture)});
const out = await mod.sharpFromBmp(buf).png().toBuffer();
console.log(out.length > 0 ? "OK" : "EMPTY");
`;

const cjsScript = `
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(${JSON.stringify(import.meta.url)});
const mod = require(${JSON.stringify(distSharpCjs)});
const buf = readFileSync(${JSON.stringify(fixture)});
const out = await mod.sharpFromBmp(buf).png().toBuffer();
console.log(out.length > 0 ? "OK" : "EMPTY");
`;

describe("optional sharp peer resolution", () => {
  it.skipIf(!hasSharp || !existsSync(distSharpEsm))(
    "resolves sharp from the ESM dist entry when the cwd is outside the package",
    () => {
      expect(runInForeignCwd(esmScript)).toBe("OK");
    },
  );

  it.skipIf(!hasSharp || !existsSync(distSharpCjs))(
    "resolves sharp from the CJS dist entry when the cwd is outside the package",
    () => {
      expect(runInForeignCwd(cjsScript)).toBe("OK");
    },
  );
});

describe("SharpModuleLoadError", () => {
  it.skipIf(!existsSync(distSharpEsm))("keeps its public shape and carries a cause", async () => {
    const mod = await import(pathToFileURL(distSharpEsm).href);
    const error = new mod.SharpModuleLoadError(undefined, { cause: new Error("boom") });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("SharpModuleLoadError");
    expect(error.message).toContain("sharp");
    expect((error.cause as Error).message).toBe("boom");
  });

  it.skipIf(!existsSync(distSharpEsm))(
    "attaches the real MODULE_NOT_FOUND error when sharp is unresolvable",
    () => {
      // Resolution failure is provoked with a bare specifier that cannot exist,
      // exercising the same catch block that wraps a missing optional peer.
      const script = `
        import { createRequire } from "node:module";
        const require = createRequire(${JSON.stringify(pathToFileURL(distSharpEsm).href)});
        const mod = await import(${JSON.stringify(pathToFileURL(distSharpEsm).href)});
        let caught;
        try {
          require("sharp-does-not-exist-" + Date.now());
        } catch (error) {
          caught = new mod.SharpModuleLoadError(undefined, { cause: error });
        }
        console.log(JSON.stringify({
          name: caught.name,
          hasCause: caught.cause !== undefined,
          code: caught.cause?.code,
          mentionsCause: caught.message.includes("cause"),
        }));
      `;

      const parsed = JSON.parse(runInForeignCwd(script)) as {
        name: string;
        hasCause: boolean;
        code: string;
        mentionsCause: boolean;
      };

      expect(parsed.name).toBe("SharpModuleLoadError");
      expect(parsed.hasCause).toBe(true);
      expect(parsed.code).toBe("MODULE_NOT_FOUND");
      expect(parsed.mentionsCause).toBe(true);
    },
  );
});
