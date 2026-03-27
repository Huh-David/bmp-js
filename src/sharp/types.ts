import type { BmpPaletteColor, EncodeBitDepth } from "../types";

export interface SharpRawDescriptor {
  width: number;
  height: number;
  channels: 3 | 4;
  premultiplied?: boolean;
}

export interface DecodedSharpInput {
  data: Uint8Array;
  raw: SharpRawDescriptor & { channels: 4 };
  width: number;
  height: number;
  channels: 4;
}

export interface SharpRawInfo {
  width: number;
  height: number;
  channels: number;
  premultiplied?: boolean;
}

export interface SharpRawLike {
  data: Uint8Array;
  info: SharpRawInfo;
}

export interface EncodeBmpOptions {
  bitDepth?: EncodeBitDepth;
  topDown?: boolean;
  palette?: BmpPaletteColor[];
}

export type BmpSharpInput = Uint8Array | ArrayBufferLike;
export type DecodeForSharpInput = Uint8Array | ArrayBufferLike;
export type SharpModule = typeof import("sharp");
export type SharpInstance = import("sharp").Sharp;
