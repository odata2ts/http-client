import { describe, expect, test } from "vitest";

import { getDefaultConfig, mergeFetchConfig } from "../src/FetchRequestConfig";

describe("FetchRequestConfig Tests", function () {
  test("get default config", async () => {
    expect(getDefaultConfig().headers).toBeDefined();
  });

  test("merge config", async () => {
    expect(mergeFetchConfig()).toBeUndefined();
  });
});
