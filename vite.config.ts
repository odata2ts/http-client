import { fileURLToPath } from "node:url";
import { defaultExclude, defineConfig } from "vitest/config";

/*
 * This config is also loaded when a package runs vitest with its own directory as root, since none of
 * `packages/*` carry their own vite/vitest config. The exclusion below describes the **aggregate run
 * started from the repository root** and must not leak into those scoped runs.
 */
const repoRoot = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");
const isAggregateRun = process.cwd() === repoRoot;

export default defineConfig({
  test: {
    // `int-test/**` needs a real OData server as a Docker container. It is its own workspace with its
    // own CI stage (`yarn int-test`), and must never be pulled into the unit / coverage run - it would
    // fail on any machine without Docker.
    exclude: isAggregateRun ? [...defaultExclude, "int-test/**"] : defaultExclude,
    coverage: {
      provider: "istanbul",
      include: ["packages/**/src/**"],
      reporter: ["lcov", "html-spa"],
    },
  },
});
