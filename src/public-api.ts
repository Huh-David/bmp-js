/**
 * Public documentation entrypoint for generated API docs.
 * Keep this file aligned with the intended user-facing API surface.
 */
export { decode } from "./decoder";
export { encode } from "./encoder";
export { decodeRgba, decodeRgb } from "./output-format";

export type {
  BmpBinaryInput,
  BmpImageData,
  BmpPaletteColor,
  DecodeColorOptions,
  DecodeOptions,
  DecodedBmp,
  DecodedRgb,
  EncodeBitDepth,
  EncodeOptions,
  EncodedBmp,
} from "./types";
