import { describe, expectTypeOf, it } from "vitest";

import {
  decode,
  encode,
  type BmpBinaryInput,
  type BmpImageData,
  type DecodeOptions,
  type DecodedBmp,
  type EncodeOptions,
  type EncodedBmp,
} from "../src/index";

describe("type contracts", () => {
  it("exposes stable encode/decode signatures", () => {
    expectTypeOf(encode).toMatchTypeOf<
      (imgData: BmpImageData, qualityOrOptions?: number | EncodeOptions) => EncodedBmp
    >();
    expectTypeOf(decode).toMatchTypeOf<
      (bmpData: BmpBinaryInput, options?: DecodeOptions) => DecodedBmp
    >();
  });
});
