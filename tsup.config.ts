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
  // Derives `__filename`/`__dirname` in the ESM output from `import.meta.url`.
  // Without this the ESM build has no `__filename` at all, and the optional
  // `sharp` peer would resolve relative to the consumer's cwd. See
  // `resolveRequireBase` in src/sharp/index.ts.
  shims: true,
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
