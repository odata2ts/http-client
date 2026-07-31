import { ODataHttpMethods } from "@odata2ts/http-client-api";
import { beforeEach, describe, expect, test } from "vitest";
import { MockClientError, MockHttpClient, MockRequestConfig } from "./MockHttpClient";

const DEFAULT_URL = "https://test.testing.com/myService/theEntity";
const DEFAULT_CONFIG: MockRequestConfig = { headers: { x: "a" }, x: "y" };
const ADDITIONAL_HEADERS = { "Content-Type": "ct" };
const DEFAULT_DATA = { a: "b" };
const JSON_VALUE = "application/json";
const DEFAULT_GET_HEADERS = { Accept: JSON_VALUE };
const DEFAULT_TYPE = { dataType: "json" };
const DEFAULT_EDIT_HEADERS = { ...DEFAULT_GET_HEADERS, "Content-Type": JSON_VALUE };
const DEFAULT_BLOB_HEADERS = { "Content-Type": "image/png", Accept: JSON_VALUE };

const DEFAULT_GET_CONFIG = { headers: DEFAULT_GET_HEADERS, ...DEFAULT_TYPE };
const DEFAULT_EDIT_CONFIG = { headers: DEFAULT_EDIT_HEADERS, ...DEFAULT_TYPE };

describe("BaseHttpClient Tests", () => {
  let mockClient: MockHttpClient;

  beforeEach(() => {
    mockClient = new MockHttpClient();
  });

  test("simple GET request", async () => {
    await mockClient.get(DEFAULT_URL);

    expect(mockClient.lastMethod).toBe(ODataHttpMethods.Get);
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

    expect(mockClient.lastMethod).toBe(ODataHttpMethods.Put);
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

    expect(mockClient.lastMethod).toBe(ODataHttpMethods.Patch);
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

  /**
   * Only a body which is explicitly declared as plain text is exempt from JSON serialization,
   * see https://github.com/odata2ts/odata2ts/issues/383.
   */
  describe("isPlainTextBody", () => {
    test("false without any headers or content type", () => {
      expect(mockClient.checkPlainTextBody()).toBe(false);
      expect(mockClient.checkPlainTextBody({})).toBe(false);
      expect(mockClient.checkPlainTextBody({ Accept: JSON_VALUE })).toBe(false);
    });

    test("true for plain text", () => {
      expect(mockClient.checkPlainTextBody({ "Content-Type": "text/plain" })).toBe(true);
    });

    test("true for plain text with charset", () => {
      expect(mockClient.checkPlainTextBody({ "Content-Type": "text/plain; charset=utf-8" })).toBe(true);
    });

    test("false for any other content type", () => {
      expect(mockClient.checkPlainTextBody({ "Content-Type": JSON_VALUE })).toBe(false);
      expect(mockClient.checkPlainTextBody({ "Content-Type": "application/xml" })).toBe(false);
      expect(mockClient.checkPlainTextBody({ "Content-Type": "image/png" })).toBe(false);
    });

    test("header name and value are matched case-insensitively", () => {
      expect(mockClient.checkPlainTextBody({ "content-type": "text/plain" })).toBe(true);
      expect(mockClient.checkPlainTextBody({ "CONTENT-TYPE": "TEXT/PLAIN" })).toBe(true);
    });

    /**
     * The default JSON content type is only overridden by a differently spelled header, so both end up in
     * the merged headers. The later one is the one which was meant to win.
     */
    test("the last of multiple content types wins", () => {
      expect(mockClient.checkPlainTextBody({ "Content-Type": JSON_VALUE, "content-type": "text/plain" })).toBe(true);
      expect(mockClient.checkPlainTextBody({ "content-type": "text/plain", "Content-Type": JSON_VALUE })).toBe(false);
    });
  });

  test("simple DELETE request", async () => {
    await mockClient.delete(DEFAULT_URL);

    expect(mockClient.lastMethod).toBe("DELETE");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toBeUndefined();
    expect(mockClient.lastInternalConfig).toStrictEqual({
      dataType: "json",
      headers: { Accept: "application/json" },
    });
  });

  test("DELETE with config", async () => {
    await mockClient.delete(DEFAULT_URL, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe(ODataHttpMethods.Delete);
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
  });

  test("generic GET request", async () => {
    await mockClient.request(DEFAULT_URL, ODataHttpMethods.Get, undefined);

    expect(mockClient.lastMethod).toBe(ODataHttpMethods.Get);
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
  });

  test("generic POST request with config", async () => {
    await mockClient.request(DEFAULT_URL, ODataHttpMethods.Post, DEFAULT_DATA, DEFAULT_CONFIG);

    expect(mockClient.lastMethod).toBe(ODataHttpMethods.Post);
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toStrictEqual(DEFAULT_DATA);
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

    expect(mockClient.lastMethod).toBe(ODataHttpMethods.Get);
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

    expect(mockClient.lastMethod).toBe(ODataHttpMethods.Get);
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBeUndefined();
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
    expect(mockClient.lastInternalConfig).toStrictEqual({ headers: ADDITIONAL_HEADERS, dataType: "stream" });
  });

  test("create blob request", async () => {
    const data = new Blob(["a", "b"]);
    const mimeType = "image/png";
    await mockClient.createBlob(DEFAULT_URL, data, mimeType);

    expect(mockClient.lastMethod).toBe("POST");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBe(data);
    expect(mockClient.lastConfig).toBeUndefined();
    expect(mockClient.lastInternalConfig).toStrictEqual({
      dataType: "blob",
      headers: DEFAULT_BLOB_HEADERS,
    });
  });

  test("create blob request with config and headers", async () => {
    const data = new Blob(["a", "b"]);
    const mimeType = "image/png";
    await mockClient.createBlob(DEFAULT_URL, data, mimeType, DEFAULT_CONFIG, ADDITIONAL_HEADERS);

    expect(mockClient.lastMethod).toBe("POST");
    expect(mockClient.lastUrl).toBe(DEFAULT_URL);
    expect(mockClient.lastData).toBe(data);
    expect(mockClient.lastConfig).toStrictEqual(DEFAULT_CONFIG);
    expect(mockClient.lastInternalConfig).toStrictEqual({
      dataType: "blob",
      headers: { ...ADDITIONAL_HEADERS, ...DEFAULT_BLOB_HEADERS },
    });
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
