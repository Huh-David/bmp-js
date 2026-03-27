import { describe, expectTypeOf, it } from "vitest";

import {
  decodeForSharp,
  encodeFromSharp,
  isBmp,
  sharpFromBmp,
  toSharpInput,
  type DecodedSharpInput,
  type EncodeBmpOptions,
  type PixelSource,
  type SharpFromBmpOptions,
  type SharpInstance,
  type SharpModule,
  type SharpRawFlatLike,
  type SharpRawInfo,
  type SharpRawLike,
} from "../../src/sharp/index";

describe("sharp adapter type contracts", () => {
  it("exposes stable sharp adapter signatures", () => {
    expectTypeOf(isBmp).toMatchTypeOf<(input: unknown) => input is PixelSource>();
    expectTypeOf(decodeForSharp).toMatchTypeOf<(input: PixelSource) => DecodedSharpInput>();
    expectTypeOf(toSharpInput).toMatchTypeOf<(input: PixelSource) => DecodedSharpInput>();
    expectTypeOf(sharpFromBmp).toMatchTypeOf<{
      (input: PixelSource, sharpModule?: SharpModule): SharpInstance;
      (options: SharpFromBmpOptions): SharpInstance;
    }>();
    expectTypeOf(encodeFromSharp).toMatchTypeOf<{
      (input: SharpRawLike, options?: EncodeBmpOptions): Uint8Array;
      (input: SharpRawFlatLike, options?: EncodeBmpOptions): Uint8Array;
      (data: PixelSource, info: SharpRawInfo, options?: EncodeBmpOptions): Uint8Array;
    }>();
  });
});
