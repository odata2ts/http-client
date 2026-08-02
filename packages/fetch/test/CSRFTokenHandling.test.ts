import { beforeEach, describe, expect, test, vi } from "vitest";
import { FetchClient } from "../src";

const TOKEN = "abc-123";
const TOKEN_KEY = "x-csrf-token";
const FETCH_URL = "https://test.testing.com";

describe("Automatic CSRF Handling Test", function () {
  let fetchClient: FetchClient;
  let requestConfigs: Array<RequestInit | undefined>;
  let requestUrls: Array<string>;

  // @ts-ignore: more simplistic parameters and returning different stuff
  global.fetch = vi.fn((url: string, config?: RequestInit | undefined): Promise<MockResponse> => {
    requestUrls.push(url);
    requestConfigs.push(config);

    const isTokenFetch = new Headers(config?.headers).get(TOKEN_KEY) === "Fetch";

    return Promise.resolve({
      status: 200,
      statusText: "OK",
      headers: new Headers(isTokenFetch ? { [TOKEN_KEY]: TOKEN } : {}),
      ok: true,
      body: null,
      // the token fetch must not be evaluated as json - if it were, this rejection would surface
      json: () =>
        isTokenFetch ? Promise.reject(new Error("the token response must not be read!")) : Promise.resolve({}),
    });
  });

  const getHeader = (config: RequestInit | undefined, key: string) => new Headers(config?.headers).get(key);

  beforeEach(() => {
    requestConfigs = [];
    requestUrls = [];
    fetchClient = new FetchClient(undefined, { useCsrfProtection: true, csrfTokenFetchUrl: FETCH_URL });
  });

  test("token is fetched and added", async () => {
    await fetchClient.post("test", {});

    expect(requestUrls).toStrictEqual([FETCH_URL, "test"]);
    // the token request itself asks for one, the actual request carries it
    expect(getHeader(requestConfigs[0], TOKEN_KEY)).toBe("Fetch");
    expect(getHeader(requestConfigs[1], TOKEN_KEY)).toBe(TOKEN);
  });

  test("no token for GET requests", async () => {
    await fetchClient.get("test");

    expect(requestUrls).toStrictEqual(["test"]);
    expect(getHeader(requestConfigs[0], TOKEN_KEY)).toBeNull();
  });

  test("token is cached", async () => {
    await fetchClient.post("test", {});
    await fetchClient.put("test", {});

    // only one token fetch for both requests
    expect(requestUrls).toStrictEqual([FETCH_URL, "test", "test"]);
    expect(getHeader(requestConfigs[2], TOKEN_KEY)).toBe(TOKEN);
  });
});
