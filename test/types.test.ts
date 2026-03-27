import { describe, expectTypeOf, it } from "vitest";

import {
  decode,
  decodeRgb,
  decodeRgba,
  encode,
  type BmpBinaryInput,
  type BmpImageData,
  type DecodeColorOptions,
  type DecodeOptions,
  type DecodedBmp,
  type DecodedRgb,
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
    expectTypeOf(decodeRgba).toMatchTypeOf<
      (bmpData: BmpBinaryInput, options?: DecodeColorOptions) => DecodedBmp
    >();
    expectTypeOf(decodeRgb).toMatchTypeOf<
      (bmpData: BmpBinaryInput, options?: DecodeColorOptions) => DecodedRgb
    >();
  });
});
