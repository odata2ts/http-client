import { MockClientError, MockHttpClient, MockRequestConfig } from "./MockHttpClient";

function mergeConfigWithHeaders(config: MockRequestConfig, headers: Record<string, string>) {
  return {
    ...config,
    headers: { ...headers, ...config.headers },
  };
}

const DEFAULT_URL = "http://test.testing.com/myService/theEntity";
const DEFAULT_CONFIG: MockRequestConfig = { headers: { x: "a" }, x: "y" };
const ADDITIONAL_HEADERS = { "Content-Type": "ct" };
const DEFAULT_DATA = { a: "b" };
const JSON_VALUE = "application/json";
const DEFAULT_GET_HEADERS = { Accept: JSON_VALUE };
const DEFAULT_EDIT_HEADERS = { ...DEFAULT_GET_HEADERS, "Content-Type": JSON_VALUE };

describe("BaseHttpClient Tests", () => {
  let mockClient: MockHttpClient;

  beforeEach(() => {
    mockClient = new MockHttpClient();
  });

  test("simple GET request", async () => {
    await mockClient.get(DEFAULT_URL);

    expect(mockClient.lastMethod).toBe("GET");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toStrictEqual({ headers: DEFAULT_GET_HEADERS });
  });

  test("fail with missing url", async () => {
    await expect(() =>
      // @ts-expect-error
      mockClient.get(undefined)
    ).rejects.toThrow("URL must be provided!");
  });

  test("GET with config", async () => {
    await mockClient.get(DEFAULT_URL, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe("GET");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toStrictEqual(mergeConfigWithHeaders(DEFAULT_CONFIG, DEFAULT_GET_HEADERS));
  });

  test("GET with additional headers", async () => {
    await mockClient.get(DEFAULT_URL, undefined, ADDITIONAL_HEADERS);
    expect(mockClient.lastConfig).toStrictEqual({ headers: { ...DEFAULT_GET_HEADERS, ...ADDITIONAL_HEADERS } });

    await mockClient.get(DEFAULT_URL, DEFAULT_CONFIG, ADDITIONAL_HEADERS);
    expect(mockClient.lastConfig).toStrictEqual(
      mergeConfigWithHeaders(mergeConfigWithHeaders(DEFAULT_CONFIG, DEFAULT_GET_HEADERS), ADDITIONAL_HEADERS)
    );
  });

  test("client error response", async () => {
    mockClient.simulateClientFailure = true;
    try {
      await mockClient.get(DEFAULT_URL);
    } catch (e) {
      expect(e).toBeInstanceOf(MockClientError);
      const error = e as MockClientError;

      expect(error.status).toBe(400);
    }
  });

  test("simple POST request", async () => {
    await mockClient.post(DEFAULT_URL, DEFAULT_DATA);

    expect(mockClient.lastMethod).toBe("POST");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(mergeConfigWithHeaders({}, DEFAULT_EDIT_HEADERS));
  });

  test("POST with config", async () => {
    await mockClient.post(DEFAULT_URL, DEFAULT_DATA, DEFAULT_CONFIG);

    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(mergeConfigWithHeaders(DEFAULT_CONFIG, DEFAULT_EDIT_HEADERS));
  });

  test("POST with no data", async () => {
    await mockClient.post(DEFAULT_URL, undefined);
    expect(mockClient.lastData).toBeUndefined();
    await mockClient.post(DEFAULT_URL, null);
    expect(mockClient.lastConfig).toStrictEqual(mergeConfigWithHeaders({}, DEFAULT_EDIT_HEADERS));
  });

  test("simple PUT request", async () => {
    await mockClient.put(DEFAULT_URL, DEFAULT_DATA);

    expect(mockClient.lastMethod).toBe("PUT");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(mergeConfigWithHeaders({}, DEFAULT_EDIT_HEADERS));
  });

  test("PUT with config", async () => {
    await mockClient.put(DEFAULT_URL, DEFAULT_DATA, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe("PUT");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(mergeConfigWithHeaders(DEFAULT_CONFIG, DEFAULT_EDIT_HEADERS));
  });

  test("simple PATCH request", async () => {
    await mockClient.patch(DEFAULT_URL, DEFAULT_DATA);

    expect(mockClient.lastMethod).toBe("PATCH");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(mergeConfigWithHeaders({}, DEFAULT_EDIT_HEADERS));
  });

  test("PATCH with config", async () => {
    await mockClient.patch(DEFAULT_URL, DEFAULT_DATA, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe("PATCH");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(mergeConfigWithHeaders(DEFAULT_CONFIG, DEFAULT_EDIT_HEADERS));
  });

  test("simple DELETE request", async () => {
    await mockClient.delete(DEFAULT_URL);

    expect(mockClient.lastMethod).toBe("DELETE");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toBeUndefined();
  });

  test("DELETE with config", async () => {
    await mockClient.delete(DEFAULT_URL, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe("DELETE");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
  });

  test("retrieveErrorMessage", async () => {
    const message = "my bad!";
    const errorMessageV4 = { error: { message } };
    const errorMessageV2 = { error: { message: { value: message } } };

    expect(mockClient.exposedErrorMessageRetriever(errorMessageV4)).toBe(message);
    expect(mockClient.exposedErrorMessageRetriever(errorMessageV2)).toBe(message);
    expect(mockClient.exposedErrorMessageRetriever(undefined)).toBeUndefined();
    expect(mockClient.exposedErrorMessageRetriever(null)).toBeUndefined();
    expect(mockClient.exposedErrorMessageRetriever({})).toBeUndefined();
    expect(mockClient.exposedErrorMessageRetriever({ error: { mes: "sttt" } })).toBeUndefined();
  });

  test("retrieveErrorMessage", () => {
    const message = "my bad!";
    mockClient.setErrorMessageRetriever((responseData: any) => message + responseData);

    expect(mockClient.exposedErrorMessageRetriever("hi")).toBe(message + "hi");
  });
});
