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
  outExtension({ format }) {
    return {
      js: format === "cjs" ? ".cjs" : ".js",
    };
  },
});
