# Compatibility

## Runtime

- Node.js: `>=22`
- Package formats: ESM + CommonJS
- Types: bundled `.d.ts` declarations

## Decode Support

| Feature                      | Status    |
| ---------------------------- | --------- |
| 1-bit BMP                    | Supported |
| 4-bit BMP                    | Supported |
| 8-bit BMP                    | Supported |
| 15-bit BMP                   | Supported |
| 16-bit BMP                   | Supported |
| 24-bit BMP                   | Supported |
| 32-bit BMP                   | Supported |
| RLE4                         | Supported |
| RLE8                         | Supported |
| CORE/INFO/V4/V5 DIB handling | Supported |

## Encode Support

| Feature                                       | Status    |
| --------------------------------------------- | --------- |
| 1-bit output                                  | Supported |
| 4-bit output                                  | Supported |
| 8-bit output                                  | Supported |
| 16-bit output                                 | Supported |
| 24-bit output                                 | Supported |
| 32-bit output                                 | Supported |
| Orientation control (`top-down`, `bottom-up`) | Supported |
| Palette-aware indexed output                  | Supported |

## Guarantees

- Fixture-backed decoding and encoding behavior.
- Quality gate in CI via `pnpm check` on clean checkout.
- Changeset-based releases with changelog tracking and provenance publishing.
