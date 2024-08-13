import { describe, expect, test } from "vitest";

import { mergeConfig } from "../src/AxiosRequestConfig";

describe("AxiosRequestConfig Tests", function () {
  test("merge config", async () => {
    expect(mergeConfig()).toBeUndefined();
  });
});
