import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/browser/**/*.test.ts"],
    globals: true,
    browser: {
      enabled: true,
      provider: "playwright",
      instances: [{ browser: "chromium" }],
    },
  },
});
