import { mergeConfig } from "../src/AxiosRequestConfig";

describe("FetchRequestConfig Tests", function () {
  test("merge config", async () => {
    expect(mergeConfig()).toBeUndefined();
  });
});
