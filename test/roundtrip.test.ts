import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

import { decode, encode } from "../src/index";

const fixturesDir = join(process.cwd(), "fixtures");

function collectBmpFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      collectBmpFiles(fullPath, acc);
      continue;
    }

    if (!entry.endsWith(".bmp")) {
      continue;
    }

    const rel = relative(fixturesDir, fullPath).split(sep).join("/");
    acc.push(rel);
  }

  return acc;
}

const fixtureFiles = collectBmpFiles(fixturesDir)
  .filter((file) => !file.endsWith("_out.bmp") && !file.startsWith("generated-invalid/"))
  .sort();

describe("BMP fixtures", () => {
  it("loads all source fixtures", () => {
    expect(fixtureFiles.length).toBeGreaterThan(0);
  });

  for (const fileName of fixtureFiles) {
    it(`decodes and roundtrips ${fileName}`, () => {
      const fixture = readFileSync(join(fixturesDir, fileName));
      const decoded = decode(fixture);

      const summary = {
        fileName,
        width: decoded.width,
        height: decoded.height,
        bitPP: decoded.bitPP,
        compress: decoded.compress,
        rawSize: decoded.rawSize,
        firstPixelABGR: Array.from(decoded.data.subarray(0, 4)),
        sampleABGR: Array.from(decoded.data.subarray(0, 20)),
      };

      expect(summary).toMatchSnapshot();

      const encoded = encode(decoded);
      const roundtrip = decode(encoded.data);

      expect(roundtrip.width).toBe(decoded.width);
      expect(roundtrip.height).toBe(decoded.height);
      expect(roundtrip.data.length).toBe(decoded.data.length);

      for (let i = 0; i < decoded.data.length; i += 4) {
        expect(roundtrip.data[i + 1]).toBe(decoded.data[i + 1]);
        expect(roundtrip.data[i + 2]).toBe(decoded.data[i + 2]);
        expect(roundtrip.data[i + 3]).toBe(decoded.data[i + 3]);
      }
    });
  }
});
