import { createRequire } from "node:module";

import { decode } from "../decoder";
import { encode } from "../encoder";
import type { EncodeOptions } from "../types";
import { InvalidSharpRawInputError, NotBmpInputError, SharpModuleLoadError } from "./errors";
import type {
  BmpSharpInput,
  DecodeForSharpInput,
  DecodedSharpInput,
  EncodeBmpOptions,
  SharpInstance,
  SharpModule,
  SharpRawDescriptor,
  SharpRawInfo,
  SharpRawLike,
} from "./types";

const require = createRequire(
  typeof __filename === "string" ? __filename : `${process.cwd()}/package.json`,
);

function toUint8Array(input: DecodeForSharpInput | BmpSharpInput): Uint8Array {
  if (input instanceof Uint8Array) {
    return input;
  }

  return new Uint8Array(input);
}

function toAbgrData(input: Uint8Array, channels: 3 | 4): Uint8Array {
  const pixelCount = Math.floor(input.length / channels);
  const output = new Uint8Array(pixelCount * 4);

  for (let src = 0, dst = 0; src < input.length; src += channels, dst += 4) {
    const red = input[src] ?? 0;
    const green = input[src + 1] ?? 0;
    const blue = input[src + 2] ?? 0;
    const alpha = channels === 4 ? (input[src + 3] ?? 0xff) : 0xff;

    output[dst] = alpha;
    output[dst + 1] = blue;
    output[dst + 2] = green;
    output[dst + 3] = red;
  }

  return output;
}

function loadSharpModule(sharpModule?: SharpModule): SharpModule {
  if (sharpModule) {
    return sharpModule;
  }

  try {
    const loaded = require("sharp") as SharpModule | { default?: SharpModule };

    if (typeof loaded === "function") {
      return loaded;
    }

    if (loaded.default && typeof loaded.default === "function") {
      return loaded.default;
    }

    throw new SharpModuleLoadError("Loaded 'sharp' module has an unexpected shape.");
  } catch (error) {
    if (error instanceof SharpModuleLoadError) {
      throw error;
    }

    throw new SharpModuleLoadError();
  }
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new InvalidSharpRawInputError(`${name} must be a positive integer.`);
  }
}

function normalizeBitDepth(
  channels: 3 | 4,
  bitDepth?: EncodeBmpOptions["bitDepth"],
): 1 | 4 | 8 | 16 | 24 | 32 {
  if (bitDepth !== undefined) {
    return bitDepth;
  }

  return channels === 4 ? 32 : 24;
}

export function isBmp(input: BmpSharpInput): boolean {
  try {
    const bytes = toUint8Array(input);
    return bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d;
  } catch {
    return false;
  }
}

export function decodeForSharp(input: DecodeForSharpInput): DecodedSharpInput {
  const bytes = toUint8Array(input);

  if (!isBmp(bytes)) {
    throw new NotBmpInputError();
  }

  const decoded = decode(bytes, { toRGBA: true });
  const raw: SharpRawDescriptor & { channels: 4 } = {
    width: decoded.width,
    height: decoded.height,
    channels: 4,
  };

  return {
    data: decoded.data,
    raw,
    width: decoded.width,
    height: decoded.height,
    channels: 4,
  };
}

export function toSharpInput(input: DecodeForSharpInput): DecodedSharpInput {
  return decodeForSharp(input);
}

export function sharpFromBmp(input: DecodeForSharpInput, sharpModule?: SharpModule): SharpInstance {
  const decoded = decodeForSharp(input);
  const sharp = loadSharpModule(sharpModule) as unknown as (
    inputData: Uint8Array,
    options: { raw: SharpRawDescriptor },
  ) => SharpInstance;

  return sharp(decoded.data, { raw: decoded.raw });
}

export function encodeFromSharp(input: SharpRawLike, options: EncodeBmpOptions = {}): Uint8Array {
  const data = toUint8Array(input.data);
  const width = input.info.width;
  const height = input.info.height;
  const channels = input.info.channels;

  assertPositiveInteger("info.width", width);
  assertPositiveInteger("info.height", height);

  if (channels !== 3 && channels !== 4) {
    throw new InvalidSharpRawInputError(
      `Unsupported channel count: ${channels}. Expected channels to be 3 or 4.`,
    );
  }

  const expectedLength = width * height * channels;
  if (data.length !== expectedLength) {
    throw new InvalidSharpRawInputError(
      `Raw buffer length mismatch: expected ${expectedLength}, received ${data.length}.`,
    );
  }

  const bitDepth = normalizeBitDepth(channels, options.bitDepth);
  const encodeOptions: EncodeOptions = {
    bitPP: bitDepth,
    orientation: options.topDown ? "top-down" : "bottom-up",
  };

  if (options.palette) {
    encodeOptions.palette = options.palette;
  }

  return encode(
    {
      data: toAbgrData(data, channels),
      width,
      height,
    },
    encodeOptions,
  ).data;
}

export {
  InvalidSharpRawInputError,
  NotBmpInputError,
  SharpAdapterError,
  SharpModuleLoadError,
} from "./errors";
export type {
  BmpSharpInput,
  DecodeForSharpInput,
  DecodedSharpInput,
  EncodeBmpOptions,
  SharpInstance,
  SharpModule,
  SharpRawDescriptor,
  SharpRawInfo,
  SharpRawLike,
} from "./types";
