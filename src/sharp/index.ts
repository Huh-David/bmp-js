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
  PixelSource,
  SharpInstance,
  SharpFromBmpOptions,
  SharpModule,
  SharpRawDescriptor,
  SharpRawFlatLike,
  SharpRawInfo,
  SharpRawLike,
} from "./types";

const require = createRequire(
  typeof __filename === "string" ? __filename : `${process.cwd()}/package.json`,
);

function toUint8Array(input: PixelSource): Uint8Array {
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
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

function normalizeSharpFromBmpArgs(
  inputOrOptions: DecodeForSharpInput | SharpFromBmpOptions,
  sharpModule?: SharpModule,
): { input: DecodeForSharpInput; sharpModule?: SharpModule } {
  if (typeof inputOrOptions === "object" && inputOrOptions !== null && "input" in inputOrOptions) {
    const options = inputOrOptions as SharpFromBmpOptions;
    const resolvedSharpModule = sharpModule ?? options.sharp;

    if (resolvedSharpModule) {
      return {
        input: options.input,
        sharpModule: resolvedSharpModule,
      };
    }

    return {
      input: options.input,
    };
  }

  if (sharpModule) {
    return {
      input: inputOrOptions as DecodeForSharpInput,
      sharpModule,
    };
  }

  return {
    input: inputOrOptions as DecodeForSharpInput,
  };
}

function normalizeEncodeFromSharpArgs(
  inputOrData: SharpRawLike | SharpRawFlatLike | PixelSource,
  infoOrOptions?: SharpRawInfo | EncodeBmpOptions,
  maybeOptions?: EncodeBmpOptions,
): { data: Uint8Array; info: SharpRawInfo; options: EncodeBmpOptions } {
  if (
    typeof inputOrData === "object" &&
    inputOrData !== null &&
    "data" in inputOrData &&
    "info" in inputOrData
  ) {
    const payload = inputOrData as SharpRawLike;
    return {
      data: toUint8Array(payload.data),
      info: payload.info,
      options: (infoOrOptions as EncodeBmpOptions | undefined) ?? {},
    };
  }

  if (
    typeof inputOrData === "object" &&
    inputOrData !== null &&
    "data" in inputOrData &&
    "width" in inputOrData &&
    "height" in inputOrData &&
    "channels" in inputOrData
  ) {
    const payload = inputOrData as SharpRawFlatLike;
    const info: SharpRawInfo = {
      width: payload.width,
      height: payload.height,
      channels: payload.channels,
    };

    if (payload.premultiplied !== undefined) {
      info.premultiplied = payload.premultiplied;
    }

    return {
      data: toUint8Array(payload.data),
      info,
      options: (infoOrOptions as EncodeBmpOptions | undefined) ?? {},
    };
  }

  if (
    typeof infoOrOptions === "object" &&
    infoOrOptions !== null &&
    "width" in infoOrOptions &&
    "height" in infoOrOptions &&
    "channels" in infoOrOptions
  ) {
    return {
      data: toUint8Array(inputOrData as PixelSource),
      info: infoOrOptions as SharpRawInfo,
      options: maybeOptions ?? {},
    };
  }

  throw new InvalidSharpRawInputError(
    "Invalid encodeFromSharp input. Expected { data, info }, { data, width, height, channels }, or (data, info).",
  );
}

export function isBmp(input: unknown): input is BmpSharpInput {
  try {
    const bytes = toUint8Array(input as BmpSharpInput);
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
    info: raw,
    width: decoded.width,
    height: decoded.height,
    channels: 4,
  };
}

/**
 * @deprecated Use decodeForSharp instead.
 */
export function toSharpInput(input: DecodeForSharpInput): DecodedSharpInput {
  return decodeForSharp(input);
}

export function sharpFromBmp(input: DecodeForSharpInput, sharpModule?: SharpModule): SharpInstance;
export function sharpFromBmp(options: SharpFromBmpOptions): SharpInstance;
export function sharpFromBmp(
  inputOrOptions: DecodeForSharpInput | SharpFromBmpOptions,
  sharpModule?: SharpModule,
): SharpInstance {
  const normalized = normalizeSharpFromBmpArgs(inputOrOptions, sharpModule);
  const decoded = decodeForSharp(normalized.input);
  const sharp = loadSharpModule(normalized.sharpModule) as unknown as (
    inputData: Uint8Array,
    options: { raw: SharpRawDescriptor },
  ) => SharpInstance;

  return sharp(decoded.data, { raw: decoded.raw });
}

export function encodeFromSharp(input: SharpRawLike, options?: EncodeBmpOptions): Uint8Array;
export function encodeFromSharp(input: SharpRawFlatLike, options?: EncodeBmpOptions): Uint8Array;
export function encodeFromSharp(
  data: PixelSource,
  info: SharpRawInfo,
  options?: EncodeBmpOptions,
): Uint8Array;
export function encodeFromSharp(
  inputOrData: SharpRawLike | SharpRawFlatLike | PixelSource,
  infoOrOptions?: SharpRawInfo | EncodeBmpOptions,
  maybeOptions?: EncodeBmpOptions,
): Uint8Array {
  const normalized = normalizeEncodeFromSharpArgs(inputOrData, infoOrOptions, maybeOptions);
  const data = normalized.data;
  const width = normalized.info.width;
  const height = normalized.info.height;
  const channels = normalized.info.channels;

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

  const bitDepth = normalizeBitDepth(channels, normalized.options.bitDepth);
  const encodeOptions: EncodeOptions = {
    bitPP: bitDepth,
    orientation: normalized.options.topDown ? "top-down" : "bottom-up",
  };

  if (normalized.options.palette) {
    encodeOptions.palette = normalized.options.palette;
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
  PixelSource,
  SharpInstance,
  SharpFromBmpOptions,
  SharpModule,
  SharpRawFlatLike,
  SharpRawDescriptor,
  SharpRawInfo,
  SharpRawLike,
} from "./types";
