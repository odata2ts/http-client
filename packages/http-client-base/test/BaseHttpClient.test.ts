import { beforeEach, describe, expect, test } from "vitest";
import { HttpMethods } from "../src";
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
const DEFAULT_TYPE = { dataType: "json" };
const DEFAULT_EDIT_HEADERS = { ...DEFAULT_GET_HEADERS, "Content-Type": JSON_VALUE };
const DEFAULT_BLOB_HEADERS = { "Content-Type": "image/png", Accept: "image/png" };

const DEFAULT_GET_CONFIG = { headers: DEFAULT_GET_HEADERS, ...DEFAULT_TYPE };
const DEFAULT_EDIT_CONFIG = { headers: DEFAULT_EDIT_HEADERS, ...DEFAULT_TYPE };

describe("BaseHttpClient Tests", () => {
  let mockClient: MockHttpClient;

  beforeEach(() => {
    mockClient = new MockHttpClient();
  });

  test("simple GET request", async () => {
    await mockClient.get(DEFAULT_URL);

    expect(mockClient.lastMethod).toBe(HttpMethods.Get);
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toBeUndefined();
    expect(mockClient.lastInternalConfig).toStrictEqual(DEFAULT_GET_CONFIG);
  });

  test("fail with missing url", async () => {
    await expect(() =>
      // @ts-expect-error
      mockClient.get(undefined),
    ).rejects.toThrow("URL must be provided!");
  });

  test("GET with config", async () => {
    await mockClient.get(DEFAULT_URL, DEFAULT_CONFIG);

    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
    expect(mockClient.lastInternalConfig).toStrictEqual(DEFAULT_GET_CONFIG);
  });

  test("GET with additional headers", async () => {
    const expectedInternalConfig = {
      ...DEFAULT_GET_CONFIG,
      headers: { ...ADDITIONAL_HEADERS, ...DEFAULT_GET_HEADERS },
    };

    await mockClient.get(DEFAULT_URL, undefined, ADDITIONAL_HEADERS);
    expect(mockClient.lastConfig).toBeUndefined();
    expect(mockClient.lastInternalConfig).toStrictEqual(expectedInternalConfig);

    await mockClient.get(DEFAULT_URL, DEFAULT_CONFIG, ADDITIONAL_HEADERS);
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
    expect(mockClient.lastInternalConfig).toStrictEqual(expectedInternalConfig);
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
    expect(mockClient.lastInternalConfig).toStrictEqual(DEFAULT_EDIT_CONFIG);
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
    expect(mockClient.lastData).toBeNull();
  });

  test("simple PUT request", async () => {
    await mockClient.put(DEFAULT_URL, DEFAULT_DATA);

    expect(mockClient.lastMethod).toBe(HttpMethods.Put);
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toBeUndefined();
    expect(mockClient.lastInternalConfig).toStrictEqual(DEFAULT_EDIT_CONFIG);
  });

  test("PUT with config", async () => {
    await mockClient.put(DEFAULT_URL, DEFAULT_DATA, DEFAULT_CONFIG);

    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
  });

  test("simple PATCH request", async () => {
    await mockClient.patch(DEFAULT_URL, DEFAULT_DATA);

    expect(mockClient.lastMethod).toBe(HttpMethods.Patch);
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toBeUndefined();
    expect(mockClient.lastInternalConfig).toStrictEqual(DEFAULT_EDIT_CONFIG);
  });

  test("PATCH with config", async () => {
    await mockClient.patch(DEFAULT_URL, DEFAULT_DATA, DEFAULT_CONFIG);

    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
  });

  test("simple DELETE request", async () => {
    await mockClient.delete(DEFAULT_URL);

    expect(mockClient.lastMethod).toBe("DELETE");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toBeUndefined();
    expect(mockClient.lastInternalConfig).toBeUndefined();
  });

  test("DELETE with config", async () => {
    await mockClient.delete(DEFAULT_URL, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe(HttpMethods.Delete);
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
  });

  test("get blob request", async () => {
    await mockClient.getBlob(DEFAULT_URL);

    expect(mockClient.lastMethod).toBe("GET");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toBeUndefined();
    expect(mockClient.lastInternalConfig).toStrictEqual({ dataType: "blob" });
  });

  test("get blob request with config and headers", async () => {
    await mockClient.getBlob(DEFAULT_URL, DEFAULT_CONFIG, ADDITIONAL_HEADERS);

    expect(mockClient.lastMethod).toBe(HttpMethods.Get);
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
    expect(mockClient.lastInternalConfig).toStrictEqual({ headers: ADDITIONAL_HEADERS, dataType: "blob" });
  });

  test("get stream request", async () => {
    await mockClient.getStream(DEFAULT_URL);

    expect(mockClient.lastMethod).toBe("GET");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toBeUndefined();
    expect(mockClient.lastInternalConfig).toStrictEqual({ dataType: "stream" });
  });

  test("get stream request with config and headers", async () => {
    await mockClient.getStream(DEFAULT_URL, DEFAULT_CONFIG, ADDITIONAL_HEADERS);

    expect(mockClient.lastMethod).toBe(HttpMethods.Get);
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
    expect(mockClient.lastInternalConfig).toStrictEqual({ headers: ADDITIONAL_HEADERS, dataType: "stream" });
  });

  test("update blob request", async () => {
    const data = new Blob(["a", "b"]);
    const mimeType = "image/png";
    await mockClient.updateBlob(DEFAULT_URL, data, mimeType);

    expect(mockClient.lastMethod).toBe("PUT");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBe(data);
    expect(mockClient.lastConfig).toBeUndefined();
    expect(mockClient.lastInternalConfig).toStrictEqual({
      dataType: "blob",
      headers: DEFAULT_BLOB_HEADERS,
    });
  });

  test("update blob request with config and headers", async () => {
    const data = new Blob(["a", "b"]);
    const mimeType = "image/png";
    await mockClient.updateBlob(DEFAULT_URL, data, mimeType, DEFAULT_CONFIG, ADDITIONAL_HEADERS);

    expect(mockClient.lastMethod).toBe("PUT");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBe(data);
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
    expect(mockClient.lastInternalConfig).toStrictEqual({
      dataType: "blob",
      headers: { ...ADDITIONAL_HEADERS, ...DEFAULT_BLOB_HEADERS },
    });
  });

  test("DELETE with config", async () => {
    await mockClient.delete(DEFAULT_URL, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe("DELETE");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
    expect(mockClient.lastInternalConfig).toBeUndefined();
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
