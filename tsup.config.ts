import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/sharp/index.ts"],
  tsconfig: "tsconfig.build.json",
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  target: "node22",
  platform: "node",
  // Deliberately off. tsup's shim is injected at the top of the *shared* chunk,
  // which the browser-safe main entry also imports, and it eagerly evaluates
  // `fileURLToPath(import.meta.url)` at module scope. Bundlers that polyfill
  // `url` (Next.js/Turbopack ships one without `fileURLToPath`) then crash on
  // `import { decode } from "@huh-david/bmp-js"` alone. The sharp entry derives
  // its own resolution base instead — see `resolveRequireBase` in
  // src/sharp/index.ts.
  shims: false,
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
