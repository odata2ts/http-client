import { beforeEach, describe, expect, test } from "vitest";
import { MockHttpClient } from "./MockHttpClient";

describe("CSRF Token Handling Tests", () => {
  const DEFAULT_URL = "https://test.testing.com/myService/theEntity";
  const DEFAULT_DATA = {};

  let mockClient: MockHttpClient;

  function getTokenFromHeader() {
    const headers = mockClient.lastInternalConfig?.headers;
    return headers ? headers[mockClient.getCsrfTokenKey()] : undefined;
  }

  beforeEach(() => {
    mockClient = new MockHttpClient({ useCsrfProtection: true, csrfTokenFetchUrl: "https://test.testing.com" });
  });

  test("fail without csrfTokenFetchUrl", () => {
    expect(() => new MockHttpClient({ useCsrfProtection: true })).toThrow("URL");
  });

  test("added generated token", async () => {
    await mockClient.post(DEFAULT_URL, DEFAULT_DATA);

    expect(getTokenFromHeader()).toBeTruthy();
    expect(getTokenFromHeader()).toBe(mockClient.generatedCsrfToken);
  });

  test("no token generation for GET requests", async () => {
    await mockClient.get(DEFAULT_URL);

    expect(mockClient.generatedCsrfToken).toBeUndefined();
  });

  test("token generation for PUT, PATCH, DELETE and caching", async () => {
    await mockClient.put("test", {});
    const token = mockClient.generatedCsrfToken;
    expect(getTokenFromHeader()).toBe(token);

    await mockClient.patch("test", {});
    expect(getTokenFromHeader()).toBe(token);

    await mockClient.delete("test");
    expect(getTokenFromHeader()).toBe(token);
  });

  test("token expiration", async () => {
    await mockClient.post("test", {});
    const token = mockClient.generatedCsrfToken;

    mockClient.simulateTokenExpired = true;
    await mockClient.post("test", {});
    const token2 = mockClient.generatedCsrfToken;

    expect(token).toBeTruthy();
    expect(token2).toBeTruthy();
    expect(token).not.toBe(token2);
  });

  /**
   * The repeated request must be the identical one: losing the internal config would strip the headers
   * (content type!) and the data type, whereby e.g. a blob would no longer be recognized as binary data.
   */
  test("token expiration retains internal config", async () => {
    const mimeType = "text/csv";
    const blob = new Blob(["hello world"], { type: mimeType });
    const requestConfig = { x: "y" };

    // the first request caches the token, the second one runs into its expiration
    await mockClient.post("test", {});
    mockClient.simulateTokenExpired = true;
    await mockClient.updateBlob("test", blob, mimeType, requestConfig, { hey: "ho" });

    expect(mockClient.lastData).toBe(blob);
    expect(mockClient.lastConfig).toStrictEqual(requestConfig);
    expect(mockClient.lastInternalConfig).toMatchObject({
      dataType: "blob",
      headers: {
        Accept: "application/json",
        "Content-Type": mimeType,
        hey: "ho",
        [mockClient.getCsrfTokenKey()]: mockClient.generatedCsrfToken!,
      },
    });
  });

  test("set token key", async () => {
    expect(mockClient.getCsrfTokenKey()).toBe("x-csrf-token");
    mockClient.setCsrfTokenKey("");
    expect(mockClient.getCsrfTokenKey()).toBe("x-csrf-token");

    mockClient.setCsrfTokenKey("test");
    await mockClient.post("test", {});

    expect(mockClient.lastInternalConfig?.headers).toBeTruthy();
    expect(mockClient.lastInternalConfig?.headers!["test"]).toBeTruthy();
  });
});
