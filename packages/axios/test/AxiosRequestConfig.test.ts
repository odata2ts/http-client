import { getDefaultConfig, mergeConfig } from "../src/AxiosRequestConfig";

describe("FetchRequestConfig Tests", function () {
  test("get default config", async () => {
    expect(getDefaultConfig().headers).toBeDefined();
  });

  test("merge config", async () => {
    expect(mergeConfig()).toBeUndefined();
  });
});
