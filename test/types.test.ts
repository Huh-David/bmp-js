import { describe, expectTypeOf, it } from "vitest";

import { decode, encode, type BmpImageData, type DecodedBmp, type EncodedBmp } from "../src/index";

describe("type contracts", () => {
  it("exposes stable encode/decode signatures", () => {
    expectTypeOf(encode).toMatchTypeOf<(imgData: BmpImageData, quality?: number) => EncodedBmp>();
    expectTypeOf(decode).toMatchTypeOf<(bmpData: Buffer) => DecodedBmp>();
  });
});
