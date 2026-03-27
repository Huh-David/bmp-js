import { decode, encode } from "../../src/index";

describe("browser smoke", () => {
  it("encodes and decodes a tiny 32-bit bitmap in browser runtime", () => {
    const width = 2;
    const height = 2;

    // ABGR pixel order expected by core encode input.
    const abgr = new Uint8Array([
      255,
      0,
      0,
      255, // red
      255,
      0,
      255,
      0, // green
      255,
      255,
      0,
      0, // blue
      255,
      255,
      255,
      255, // white
    ]);

    const encoded = encode({ data: abgr, width, height }, { bitPP: 32, orientation: "top-down" });
    expect(encoded.data[0]).toBe(0x42);
    expect(encoded.data[1]).toBe(0x4d);

    const decoded = decode(encoded.data);
    expect(decoded.width).toBe(width);
    expect(decoded.height).toBe(height);
    expect(decoded.data.length).toBe(width * height * 4);
  });

  it("supports RGBA decode option in browser runtime", () => {
    const input = new Uint8Array([
      255,
      0,
      0,
      255, // ABGR red
      255,
      0,
      255,
      0, // ABGR green
      255,
      255,
      0,
      0, // ABGR blue
      255,
      255,
      255,
      255, // ABGR white
    ]);
    const encoded = encode(
      { data: input, width: 2, height: 2 },
      { bitPP: 32, orientation: "top-down" },
    );

    const decodedRgba = decode(encoded.data, { toRGBA: true });
    expect(Array.from(decodedRgba.data.subarray(0, 4))).toEqual([255, 0, 0, 255]);
  });
});
