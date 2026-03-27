import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    exclude: [...configDefaults.exclude, "test/browser/**/*.test.ts"],
    globals: true,
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
