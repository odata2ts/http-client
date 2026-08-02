import { beforeEach, describe, expect, test } from "vitest";
import { FAILURE_STREAM_UNSUPPORTED, JQueryClient, JQueryClientError, JQueryRequestConfig } from "../src";
import { JqMock } from "./JQueryMock";

const DEFAULT_URL = "TEST/hi";
const DEFAULT_REQUEST_CONFIG: JQueryRequestConfig = { timeout: 666, headers: { test: "test" } };
const JSON_VALUE = "application/json";
const DEFAULT_GET_HEADERS = { Accept: JSON_VALUE };
const DEFAULT_EDIT_HEADERS = { ...DEFAULT_GET_HEADERS, "Content-Type": JSON_VALUE };

describe("JQueryClient Tests", function () {
  let jqMock: JqMock;
  let jqClient: JQueryClient;

  const DEFAULT_CONFIG = {
    url: DEFAULT_URL,
    method: "GET",
  };

  const getRequestData = () => {
    return jqMock.getRequestConfig()?.data;
  };

  const getRequestHeaders = () => {
    return jqMock.getRequestConfig()?.headers;
  };

  /**
   * request config without headers
   */
  const getRequestDetails = () => {
    const { data, headers, success, error, ...result } = jqMock.getRequestConfig() || {};
    return result;
  };

  beforeEach(() => {
    jqMock = new JqMock();
    jqClient = new JQueryClient(jqMock as unknown as JQueryStatic);

    jqMock.successResponse();
  });

  test("get request", async () => {
    await jqClient.get(DEFAULT_URL);

    expect(getRequestDetails()).toStrictEqual(DEFAULT_CONFIG);
    expect(getRequestHeaders()).toStrictEqual(DEFAULT_GET_HEADERS);
  });

  test("invalid url", async () => {
    await expect(
      // @ts-ignore
      jqClient.get(null),
    ).rejects.toThrow("Value for URL must be provided!");
    await expect(
      // @ts-ignore
      jqClient.get(undefined),
    ).rejects.toThrow("Value for URL must be provided!");
  });

  test("using global options", async () => {
    // @ts-ignore
    jqClient = new JQueryClient(jqMock, DEFAULT_REQUEST_CONFIG);
    await jqClient.get(DEFAULT_URL);

    expect(getRequestDetails()).toStrictEqual({ ...DEFAULT_CONFIG, timeout: DEFAULT_REQUEST_CONFIG.timeout });
    expect(getRequestHeaders()).toStrictEqual({ ...DEFAULT_GET_HEADERS, ...DEFAULT_REQUEST_CONFIG.headers });
  });

  test("using config", async () => {
    const { timeout, headers } = DEFAULT_REQUEST_CONFIG;
    await jqClient.get(DEFAULT_URL, DEFAULT_REQUEST_CONFIG);

    expect(getRequestDetails()).toStrictEqual({ ...DEFAULT_CONFIG, timeout });
    expect(getRequestHeaders()).toStrictEqual({ ...DEFAULT_GET_HEADERS, ...headers });
  });

  test("using additional headers", async () => {
    const headers = { hey: "Ho", "Content-Type": "tester" };

    await jqClient.get(DEFAULT_URL, undefined, headers);

    expect(getRequestHeaders()).toStrictEqual({ ...DEFAULT_GET_HEADERS, ...headers });
  });

  test("request config overrides everything", async () => {
    // @ts-ignore
    jqClient = new JQueryClient(jqMock, { headers: { Accept: "x", def: "default" } });

    const headers = { Accept: "hey", "Content-Type": "Ho", test: "test" };
    const config: JQueryRequestConfig = {
      // @ts-expect-error: method is not exposed as it should not be overridden
      method: "POST",
      headers,
    };

    await jqClient.get("", config, { test: "added", extra: "x" });

    // method has not been overridden
    expect(getRequestDetails()).toMatchObject({ method: "GET" });
    // headers have been overridden
    expect(getRequestHeaders()).toStrictEqual({ ...headers, def: "default", extra: "x" });
  });

  test("post request", async () => {
    await jqClient.post(DEFAULT_URL, {});

    expect(getRequestData()).toBe("{}");
    expect(getRequestDetails()).toMatchObject({ url: DEFAULT_URL, method: "POST" });
    expect(getRequestHeaders()).toStrictEqual(DEFAULT_EDIT_HEADERS);
  });

  test("post request with different data", async () => {
    await jqClient.post("", undefined);
    expect(getRequestData()).toBeUndefined();

    jqMock.successResponse();
    await jqClient.post("", null);
    expect(getRequestData()).toBe("null");

    jqMock.successResponse();
    await jqClient.post("", "");
    expect(getRequestData()).toBe('""');

    jqMock.successResponse();
    const dataStructure = { test: "hey", collection: [{ hey: 3 }] };
    await jqClient.post("", dataStructure);
    expect(getRequestData()).toBe(JSON.stringify(dataStructure));
  });

  /**
   * A plain text body goes over the wire as it is: JSON serializing it would wrap it into double quotes,
   * which the server cannot parse. See https://github.com/odata2ts/odata2ts/issues/383.
   */
  test("post request with plain text body", async () => {
    const query = "%24select=UserName&%24top=10";

    await jqClient.post("", query, undefined, { "Content-Type": "text/plain" });

    expect(getRequestData()).toBe(query);
    expect(getRequestData()).not.toMatch(/^"/);
  });

  test("put request", async () => {
    await jqClient.put(DEFAULT_URL, {});

    expect(getRequestDetails()).toMatchObject({ url: DEFAULT_URL, method: "PUT" });
  });

  test("patch request", async () => {
    await jqClient.patch(DEFAULT_URL, {});

    expect(getRequestDetails()).toMatchObject({ url: DEFAULT_URL, method: "PATCH" });
    expect(getRequestHeaders()).toStrictEqual(DEFAULT_EDIT_HEADERS);
  });

  test("delete request", async () => {
    await jqClient.delete(DEFAULT_URL);

    expect(getRequestDetails()).toMatchObject({ url: DEFAULT_URL, method: "DELETE" });
    expect(getRequestHeaders()).toStrictEqual({ Accept: "application/json" });
  });

  /*  test("simulate 204 no content", async () => {
    simulateNoContent = true;
    const response = await jqClient.post(DEFAULT_URL, {});

    expect(response.status).toBe(204);
    expect(response.data).toBeUndefined();
  });*/

  test("using params in request config", async () => {
    const params = { hey: "Ho", a: 111, list: ["a", "b"] };

    await jqClient.get("test", { params });

    expect(getRequestDetails().url).toBe("test?hey=Ho&a=111&list=a%2Cb");

    jqMock.successResponse();
    await jqClient.get("test?x=y", { params });
    expect(getRequestDetails().url).toStrictEqual("test?x=y&hey=Ho&a=111&list=a%2Cb");
  });

  test("using global params", async () => {
    const params = { hey: "Ho", a: 111, list: ["a", "b"] };
    jqClient = new JQueryClient(jqMock as unknown as JQueryStatic, { params });

    await jqClient.get("test");

    expect(getRequestDetails().url).toStrictEqual("test?hey=Ho&a=111&list=a%2Cb");

    jqMock.successResponse();
    await jqClient.get("test?x=y");
    expect(getRequestDetails().url).toStrictEqual("test?x=y&hey=Ho&a=111&list=a%2Cb");
  });

  test("get blob request", async () => {
    await jqClient.getBlob(DEFAULT_URL);

    expect(getRequestDetails()).toMatchObject({ url: DEFAULT_URL, method: "GET", xhrFields: { responseType: "blob" } });
    expect(getRequestHeaders()).toStrictEqual({});
  });

  /**
   * Binary data must reach the server as it is: JSON serializing a blob would yield "{}", while jQuery's
   * processData would turn it into a query string. See https://github.com/odata2ts/odata2ts/issues/421.
   */
  test("create blob request", async () => {
    const mimeType = "text/csv";
    const blob = new Blob(["hello world"], { type: mimeType });

    await jqClient.createBlob(DEFAULT_URL, blob, mimeType);

    expect(getRequestData()).toBe(blob);
    expect(getRequestDetails()).toMatchObject({
      url: DEFAULT_URL,
      method: "POST",
      xhrFields: { responseType: "blob" },
      processData: false,
      contentType: false,
    });
    expect(getRequestHeaders()).toStrictEqual({ Accept: JSON_VALUE, "Content-Type": mimeType });
  });

  test("update blob request", async () => {
    const mimeType = "image/jpg";
    const blob = new Blob([new Uint8Array([1, 2, 3])], { type: mimeType });

    await jqClient.updateBlob(DEFAULT_URL, blob, mimeType);

    expect(getRequestData()).toBe(blob);
    expect(getRequestDetails()).toMatchObject({
      url: DEFAULT_URL,
      method: "PUT",
      xhrFields: { responseType: "blob" },
      processData: false,
      contentType: false,
    });
    expect(getRequestHeaders()).toStrictEqual({ Accept: JSON_VALUE, "Content-Type": mimeType });
  });

  test("stream request not supported", async () => {
    await expect(() => jqClient.getStream(DEFAULT_URL)).rejects.toThrow(FAILURE_STREAM_UNSUPPORTED);
    // a refusal is a failure of this client like any other, hence the same error type
    await expect(() => jqClient.getStream(DEFAULT_URL)).rejects.toBeInstanceOf(JQueryClientError);
  });

  test("stream upload not supported either", async () => {
    const mimeType = "text/csv";
    const stream = new Blob(["hello world"]).stream();

    await expect(() => jqClient.createStream(DEFAULT_URL, stream, mimeType)).rejects.toThrow(
      FAILURE_STREAM_UNSUPPORTED,
    );
    await expect(() => jqClient.updateStream(DEFAULT_URL, stream, mimeType)).rejects.toBeInstanceOf(JQueryClientError);

    // nothing went over the wire
    expect(jqMock.getRequestConfig()).toBeUndefined();
  });
});
