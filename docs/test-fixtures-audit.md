# BMP Test Fixture Audit (Legal + Technical)

Date: 2026-03-27
Repository: `@huh-david/bmp-js`

## 1. Executive recommendation

Use a two-tier corpus:

1. Vendor a **minimal, explicit-license corpus** now from:
   - The Bitmap Test Suite (SourceForge, public-domain dedication)
   - BMP Suite image outputs only (public domain), excluding ICC-profile-related files
2. Add **generated deterministic fixtures** for exact encoder assertions and malformed edge cases.
3. Keep ambiguous sources as **external/manual references only** until license terms are explicit.

This gives broad decoder coverage (bit depth, RLE, header variants, malformed inputs) while keeping legal risk low.

## 2. Source audit table

| Source                                 | Exact URL                                              | BMP variants / usefulness                                                                         | Direct download                   | Explicit license?                                          | Commit-safe?                    | Attribution / notice                      | Recommended usage                                              |
| -------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------- | ------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| The Bitmap Test Suite                  | https://sourceforge.net/projects/bmptestsuite/         | Strong decoder corpus: 1/4/8/24/32, 555/565, RLE4/8, top-down, corrupt/questionable files         | Yes (`/files/latest/download`)    | Yes (Public Domain + `COPYING`)                            | Yes                             | Keep provenance notice                    | Vendor curated subset; keep full set optional for local stress |
| BMP Suite (Entropymine)                | https://entropymine.com/jason/bmpsuite/                | Very broad conformance set: palette/indexed, RLE, OS/2 v1/v2, V4/V5, unusual masks, invalid files | Yes (`releases/bmpsuite-2.8.zip`) | Yes, with split terms (GPL generator; generated images PD) | Yes, with exclusions            | Keep provenance note + ICC exception note | Vendor selected BMPs only; exclude ICC-profile BMPs            |
| ConvertICO samples                     | https://convertico.com/samples/bmp/                    | Basic sample files; low conformance depth                                                         | Yes                               | Conflicting signals; Terms contain restrictions            | No                              | N/A                                       | External/manual only after legal review                        |
| John Burkardt (FSU mirror)             | https://people.sc.fsu.edu/~jburkardt/data/bmp/bmp.html | General examples; limited conformance value                                                       | Yes                               | Ambiguous: page text says page info is MIT                 | No (unclear file-level license) | N/A                                       | External only; request explicit file license                   |
| John Burkardt (older mirror)           | https://people.math.sc.edu/Burkardt/data/bmp/bmp.html  | Same content family                                                                               | Partially                         | Says code + data under GNU LGPL                            | Needs manual review             | LGPL obligations if used                  | Do not vendor until mirror conflict resolved                   |
| Hlevkin collection                     | https://www.hlevkin.com/hlevkin/06testimages.htm       | Natural-image samples; weak conformance coverage                                                  | Yes                               | No explicit license found                                  | No                              | N/A                                       | Exclude from repo fixtures                                     |
| Upstream `shaozilee/bmp-js` test files | https://github.com/shaozilee/bmp-js/tree/master/test   | Matches historic fixture names; useful for regression continuity                                  | Yes                               | Repo is MIT, fixture provenance not documented             | Needs manual review             | Provenance still required                 | Replace with explicit-license or generated equivalents         |

Machine-readable registry: `docs/test-fixture-sources.json`

## 3. Licensing evidence with quoted text

### The Bitmap Test Suite (safe)

SourceForge metadata:

> "License ... Public Domain"

Source: https://sourceforge.net/projects/bmptestsuite/

Archive `COPYING` text:

> "once placed in the public domain, the Work may be freely reproduced ... exploited by anyone for any purpose"

Source: https://sourceforge.net/projects/bmptestsuite/files/latest/download

### BMP Suite (safe with exclusions)

Project page:

> "Source code (in C; GPLv3) for generating the files"

Source: https://entropymine.com/jason/bmpsuite/

README split-license statement:

> "Image files generated by this program ... are in the public domain"

Source: https://entropymine.com/jason/bmpsuite/bmpsuite/readme.txt

README caveat:

> "The ICC profiles in the \"data\" subdirectory are not covered by this license."

Source: https://entropymine.com/jason/bmpsuite/bmpsuite/readme.txt

### ConvertICO (do not vendor)

Samples page claim:

> "all sample BMP files are completely free to download and use"

Source: https://convertico.com/samples/bmp/

Terms restriction:

> "limited, non-exclusive, non-transferable license"

> "does not allow you to ... \"mirror\" the materials on any other server"

Source: https://convertico.com/terms

Assessment: ambiguous/conflicting; not safe to vendor.

### Burkardt mirrors (ambiguous)

FSU mirror:

> "The information on this web page is distributed under the MIT license."

Source: https://people.sc.fsu.edu/~jburkardt/data/bmp/bmp.html

Older mirror:

> "The computer code and data files ... are distributed under ... the GNU LGPL license."

Source: https://people.math.sc.edu/Burkardt/data/bmp/bmp.html

Assessment: mirror conflict + unclear file-level terms on current mirror.

### Hlevkin (unclear)

No explicit license/terms statement found on the collection page.

Source checked: https://www.hlevkin.com/hlevkin/06testimages.htm

### Upstream `bmp-js` fixtures (needs review)

Repository declares MIT, but fixture origin is not documented.

> "You can use for free with MIT License"

Source: https://github.com/shaozilee/bmp-js/blob/master/README.md

## 4. Recommended files to vendor now

### From The Bitmap Test Suite

- `valid/1bpp-1x1.bmp`
- `valid/4bpp-1x1.bmp`
- `valid/8bpp-1x1.bmp`
- `valid/24bpp-1x1.bmp`
- `valid/32bpp-1x1.bmp`
- `valid/555-1x1.bmp`
- `valid/565-1x1.bmp`
- `valid/rle4-absolute-320x240.bmp`
- `valid/rle8-absolute-320x240.bmp`
- `valid/1bpp-topdown-320x240.bmp`
- `valid/8bpp-topdown-320x240.bmp`
- `valid/32bpp-topdown-320x240.bmp`
- `corrupt/emptyfile.bmp`
- `corrupt/magicnumber-bad.bmp`
- `corrupt/infoheader-missing.bmp`
- `corrupt/pixeldata-missing.bmp`
- `corrupt/rle8-no-end-of-line-marker.bmp`

### From BMP Suite (exclude ICC-profile BMPs)

- `g/pal1.bmp`
- `g/pal4.bmp`
- `g/pal8.bmp`
- `g/pal4rle.bmp`
- `g/pal8rle.bmp`
- `g/pal8topdown.bmp`
- `g/pal8os2.bmp`
- `q/pal8os2v2.bmp`
- `g/pal8v4.bmp`
- `g/pal8v5.bmp`
- `g/rgb16-565.bmp`
- `g/rgb16bfdef.bmp`
- `q/rgba16-4444.bmp`
- `q/rgba16-5551.bmp`
- `b/shortfile.bmp`
- `b/badheadersize.bmp`

## 5. Files to exclude and why

- ConvertICO samples: Terms restrict mirroring/material reuse language; licensing not fixture-clear.
- Hlevkin files: no explicit reusable license found.
- Burkardt files: conflicting mirror licensing; unclear whether current hosted BMP files are MIT/LGPL/other.
- Upstream `bmp-js` fixture binaries: no fixture provenance chain; MIT at repo level is insufficient by itself for third-party binaries.
- BMP Suite files with embedded/linked profiles (`q/rgb24prof.bmp`, `q/rgb24prof2.bmp`, `q/rgb24lprof.bmp`): exception references ICC/profile content not covered by suite license statement.

## 6. Proposed generated fixtures

Create deterministic fixtures in `fixtures/generated/` and `fixtures/generated-invalid/`:

- Minimal valid fixtures per bit depth: `1, 4, 8, 16(555), 16(565), 24, 32`, each as tiny 2x2 and 3x1 patterns.
- Palette/indexed fixtures: custom palette order tests, undersized/oversized palette edge tests.
- Compression fixtures: tiny hand-encoded RLE4 and RLE8 streams with delta, EOL, EOB cases.
- Top-down fixtures: negative height variants for 8/24/32 bpp.
- Header variants: BITMAPCOREHEADER (OS/2 v1-style), INFOHEADER, V4, V5 minimal examples.
- Malformed fixtures: truncated headers, bad `bfOffBits`, impossible dimensions, inconsistent `biSizeImage`, missing palette.

Generation strategy:

- Use a script that writes BMP bytes directly from deterministic pixel buffers.
- Keep fixtures tiny and checksum-verified.
- Store generator metadata (seed, format params, expected decode summary) next to outputs.

## 7. Test matrix mapping fixtures to decoder/encoder behaviors

| Behavior                         | Fixture type                                   | Assertions                                                                                        |
| -------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Decoder success: basic depths    | 1/4/8/16/24/32 valid fixtures                  | width/height, `bitPP`, `compress`, expected ABGR bytes                                            |
| Decoder success: indexed/palette | palette fixtures incl altered palette ordering | palette index mapping to ABGR correctness                                                         |
| Decoder success: compression     | RLE4/RLE8 valid and delta fixtures             | decoded pixel runs match expected map                                                             |
| Decoder success: orientation     | top-down and bottom-up pairs                   | row order correctness                                                                             |
| Decoder success: headers         | INFOHEADER, V4, V5, OS/2 samples               | header parsing fields and compatibility behavior                                                  |
| Decoder failure: malformed       | truncated/corrupt fixtures                     | throws predictable errors; no crash/hang                                                          |
| Metadata assertions              | mixed corpus                                   | file size/offset/raw size sanity checks                                                           |
| Pixel layout assertions          | all decode-success fixtures                    | explicit ABGR channel-order checks                                                                |
| Round-trip encode/decode         | generated deterministic fixtures               | RGB channels stable after round-trip; dimensions unchanged                                        |
| Golden/snapshot strategy         | decode summaries + first N ABGR pixels         | stable snapshots for parser behavior; golden BMP only for encoder byte layout where deterministic |

## 8. Follow-up actions

1. Add `fixtures/third-party/NOTICE.md` with provenance rows for each vendored binary.
2. Import only the curated safe subset from The Bitmap Test Suite and BMP Suite.
3. Add `scripts/generate-bmp-fixtures.ts` for deterministic generated fixtures.
4. Replace legacy provenance-unknown fixtures over time with safe/generated counterparts.
5. Add CI job that validates fixture provenance entries exist for every third-party file.
6. Optionally maintain a local-only script to fetch full external corpora for extended non-CI stress tests.

---

## Final lists requested

### Safe to commit now

- Curated files from The Bitmap Test Suite (SourceForge PD).
- Curated BMP-image files from BMP Suite where no ICC-profile exception applies.
- Deterministic internally generated fixtures and malformed test binaries created in this repository.

### Needs manual license review

- John Burkardt BMP files (mirror conflict: FSU MIT-page wording vs older LGPL data wording).
- Existing upstream `shaozilee/bmp-js` fixture binaries without source-provenance chain.

### Best generated internally

- Encoder golden fixtures for exact expected byte layout.
- Malformed/truncated header and offset corruption cases.
- Tiny deterministic RLE delta/EOL/EOB edge cases.
- Minimal OS/2/V4/V5 header edge fixtures where external licensing is unclear or over-broad.
