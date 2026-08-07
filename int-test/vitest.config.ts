import { defineConfig } from "vitest/config";

/**
 * Integration tests for the odata2ts HTTP clients against the CAP "Library" test server.
 *
 * `globalSetup` provisions the running server (Docker container via testcontainers, or an externally
 * started server when `LIBRARY_BASE_URL` is set) and hands its base URL to the tests via `provide` /
 * `inject`. See `test/globalSetup.ts`.
 *
 * jquery.test.ts and angular.test.ts each carry their own `// @vitest-environment jsdom` pragma, since
 * both clients are XHR-based and need a real `XMLHttpRequest`; fetch.test.ts and axios.test.ts run in the
 * default node environment.
 */
export default defineConfig({
  test: {
    globalSetup: ["./test/globalSetup.ts"],
    include: ["test/**/*.test.ts"],
    // integration tests hit a real server - no artificial timeouts
    testTimeout: 30_000,
    // pulling and starting the container happens within the setup hook
    hookTimeout: 180_000,
    // every client creates/patches/deletes the same well-known book, so files must not race each other
    fileParallelism: false,
  },
});
