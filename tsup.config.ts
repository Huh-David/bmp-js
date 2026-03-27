import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  tsconfig: "tsconfig.build.json",
  format: ["esm", "cjs"],
  dts: {
    entry: "src/index.ts",
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  target: "node22",
  platform: "node",
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
