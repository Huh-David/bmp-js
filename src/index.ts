import { decode } from "./decoder";
import { encode } from "./encoder";

export type {
  BmpBinaryInput,
  EncodeBitDepth,
  BmpImageData,
  BmpPaletteColor,
  DecodeOptions,
  DecodedBmp,
  EncodeOptions,
  EncodedBmp,
} from "./types";
export { BmpDecoder } from "./decoder";
export { BmpEncoder } from "./encoder";
export { encode, decode };

const bmp = {
  encode,
  decode,
};

export default bmp;
