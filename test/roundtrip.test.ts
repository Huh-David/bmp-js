import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { decode, encode } from "../src/index";

const fixturesDir = join(process.cwd(), "fixtures");
const fixtureFiles = readdirSync(fixturesDir)
  .filter((file) => file.endsWith(".bmp") && !file.endsWith("_out.bmp"))
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
