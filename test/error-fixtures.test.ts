import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { decode } from "../src/index";

const invalidDir = join(process.cwd(), "fixtures", "generated-invalid");
const invalidFixtures = readdirSync(invalidDir)
  .filter((file) => file.endsWith(".bmp"))
  .sort();

describe("Malformed fixtures", () => {
  it("loads malformed fixture list", () => {
    expect(invalidFixtures.length).toBeGreaterThan(0);
  });

  for (const fileName of invalidFixtures) {
    it(`throws for ${fileName}`, () => {
      const bytes = readFileSync(join(invalidDir, fileName));
      expect(() => decode(bytes)).toThrow(/invalid|unsupported|out-of-range|overlaps|truncated/i);
    });
  }
});
