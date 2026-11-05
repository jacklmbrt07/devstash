import path from "node:path";
import { fileURLToPath } from "node:url";

import { configDefaults, defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: `${path.resolve(rootDir, "src")}/`,
      },
    ],
  },
  test: {
    environment: "node",
    include: ["src/actions/**/*.test.ts", "src/lib/**/*.test.ts"],
    exclude: [
      ...configDefaults.exclude,
      "src/components/**",
      "src/app/**",
      "**/*.tsx",
    ],
  },
});
