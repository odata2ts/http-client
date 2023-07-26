import { MockClientError, MockHttpClient, MockRequestConfig } from "./MockHttpClient";

describe("BaseHttpClient Tests", () => {
  const DEFAULT_URL = "http://test.testing.com/myService/theEntity";
  const DEFAULT_CONFIG: MockRequestConfig = { headers: { x: "a" }, x: "y" };
  const DEFAULT_DATA = { a: "b" };

  let mockClient: MockHttpClient;

  beforeEach(() => {
    mockClient = new MockHttpClient();
  });

  test("simple GET request", async () => {
    await mockClient.get(DEFAULT_URL);

    expect(mockClient.lastMethod).toBe("GET");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toBeUndefined();
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
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
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
    expect(mockClient.lastConfig).toBeUndefined();
  });

  test("POST with config", async () => {
    await mockClient.post(DEFAULT_URL, DEFAULT_DATA, DEFAULT_CONFIG);

    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
  });

  test("POST with no data", async () => {
    await mockClient.post(DEFAULT_URL, undefined);
    expect(mockClient.lastData).toBeUndefined();
    await mockClient.post(DEFAULT_URL, null);
    expect(mockClient.lastConfig).toBeUndefined();
  });

  test("simple PUT request", async () => {
    await mockClient.put(DEFAULT_URL, DEFAULT_DATA);

    expect(mockClient.lastMethod).toBe("PUT");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toBeUndefined();
  });

  test("PUT with config", async () => {
    await mockClient.put(DEFAULT_URL, DEFAULT_DATA, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe("PUT");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
  });

  test("simple PATCH request", async () => {
    await mockClient.patch(DEFAULT_URL, DEFAULT_DATA);

    expect(mockClient.lastMethod).toBe("PATCH");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toBeUndefined();
  });

  test("PATCH with config", async () => {
    await mockClient.patch(DEFAULT_URL, DEFAULT_DATA, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe("PATCH");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
  });

  test("simple MERGE request", async () => {
    await mockClient.merge(DEFAULT_URL, DEFAULT_DATA);

    expect(mockClient.lastMethod).toBe("POST");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual({ headers: { "X-Http-Method": "MERGE" } });
  });

  test("MERGE with config", async () => {
    await mockClient.merge(DEFAULT_URL, DEFAULT_DATA, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe("POST");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual({
      ...DEFAULT_CONFIG,
      headers: { ...{ "X-Http-Method": "MERGE" }, ...DEFAULT_CONFIG.headers },
    });
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

  test("retrieve big numbers as string", async () => {
    mockClient.retrieveBigNumbersAsString(true);
    await mockClient.get(DEFAULT_URL);

    expect(mockClient.lastConfig?.headers).toStrictEqual({
      Accept: "application/json;IEEE754Compatible=true",
      "Content-Type": "application/json;IEEE754Compatible=true",
    });

    mockClient.retrieveBigNumbersAsString(false);
    await mockClient.get(DEFAULT_URL);

    expect(mockClient.lastConfig?.headers).toBeUndefined();
  });
});
