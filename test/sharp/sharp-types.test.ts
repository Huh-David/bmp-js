import { describe, expectTypeOf, it } from "vitest";

import {
  decodeForSharp,
  encodeFromSharp,
  isBmp,
  sharpFromBmp,
  toSharpInput,
  type DecodedSharpInput,
  type EncodeBmpOptions,
  type SharpInstance,
  type SharpModule,
  type SharpRawLike,
} from "../../src/sharp/index";

describe("sharp adapter type contracts", () => {
  it("exposes stable sharp adapter signatures", () => {
    expectTypeOf(isBmp).toMatchTypeOf<(input: Uint8Array | ArrayBufferLike) => boolean>();
    expectTypeOf(decodeForSharp).toMatchTypeOf<
      (input: Uint8Array | ArrayBufferLike) => DecodedSharpInput
    >();
    expectTypeOf(toSharpInput).toMatchTypeOf<
      (input: Uint8Array | ArrayBufferLike) => DecodedSharpInput
    >();
    expectTypeOf(sharpFromBmp).toMatchTypeOf<
      (input: Uint8Array | ArrayBufferLike, sharpModule?: SharpModule) => SharpInstance
    >();
    expectTypeOf(encodeFromSharp).toMatchTypeOf<
      (input: SharpRawLike, options?: EncodeBmpOptions) => Uint8Array
    >();
  });
});
