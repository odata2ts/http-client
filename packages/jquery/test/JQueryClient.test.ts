import { AjaxRequestConfig, JQueryClient } from "../src";
import { JqMock } from "./JQueryMock";

describe("JQueryClient Tests", function () {
  let jqMock: JqMock;
  let jqClient: JQueryClient;

  const DEFAULT_URL = "TEST/hi";
  const DEFAULT_REQUEST_CONFIG: AjaxRequestConfig = { timeout: 666, headers: { test: "test" } };

  const DEFAULT_CONFIG = {
    url: DEFAULT_URL,
    method: "GET",
    // dataType: "json",
    cache: false,
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
    expect(getRequestHeaders()).toStrictEqual({});
  });

  test("invalid url", async () => {
    await expect(
      // @ts-ignore
      jqClient.get(null)
    ).rejects.toThrow("Value for URL must be provided!");
    await expect(
      // @ts-ignore
      jqClient.get(undefined)
    ).rejects.toThrow("Value for URL must be provided!");
  });

  test("using global options", async () => {
    // @ts-ignore
    jqClient = new JQueryClient(jqMock, DEFAULT_REQUEST_CONFIG);
    await jqClient.get(DEFAULT_URL);

    expect(getRequestDetails()).toStrictEqual({ ...DEFAULT_CONFIG, timeout: DEFAULT_REQUEST_CONFIG.timeout });
    expect(getRequestHeaders()).toStrictEqual(DEFAULT_REQUEST_CONFIG.headers);
  });

  test("using config", async () => {
    const { timeout, headers } = DEFAULT_REQUEST_CONFIG;
    await jqClient.get(DEFAULT_URL, DEFAULT_REQUEST_CONFIG);

    expect(getRequestDetails()).toStrictEqual({ ...DEFAULT_CONFIG, timeout });
    expect(getRequestHeaders()).toStrictEqual(headers);
  });

  test("using additional headers", async () => {
    const headers = { hey: "Ho", "Content-Type": "tester" };

    await jqClient.get(DEFAULT_URL, undefined, headers);

    expect(getRequestHeaders()).toStrictEqual(headers);
  });

  test("request config overrides everything", async () => {
    // @ts-ignore
    jqClient = new JQueryClient(jqMock, { headers: { Accept: "x", def: "default" } });

    const headers = { Accept: "hey", "Content-Type": "Ho", test: "test" };
    const config: AjaxRequestConfig = {
      // @ts-ignore: method is not exposed as it should not be overridden
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
    expect(getRequestHeaders()).toStrictEqual({});
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

  test("put request", async () => {
    await jqClient.put(DEFAULT_URL, {});

    expect(getRequestDetails()).toMatchObject({ url: DEFAULT_URL, method: "PUT" });
  });

  test("patch request", async () => {
    await jqClient.patch(DEFAULT_URL, {});

    expect(getRequestDetails()).toMatchObject({ url: DEFAULT_URL, method: "PATCH" });
    expect(getRequestHeaders()).toStrictEqual({});
  });

  test("delete request", async () => {
    await jqClient.delete(DEFAULT_URL);

    expect(getRequestDetails()).toMatchObject({ url: DEFAULT_URL, method: "DELETE" });
    expect(getRequestHeaders()).toStrictEqual({});
  });

  /*  test("simulate 204 no content", async () => {
    simulateNoContent = true;
    const response = await jqClient.post(DEFAULT_URL, {});

    expect(response.status).toBe(204);
    expect(response.data).toBeUndefined();
  });*/

  test("get blob request", async () => {
    await jqClient.getBlob(DEFAULT_URL);

    expect(getRequestDetails()).toMatchObject({ url: DEFAULT_URL, method: "GET", xhrFields: { responseType: "blob" } });
    expect(getRequestHeaders()).toStrictEqual({});
  });

  test("update blob request", async () => {
    await jqClient.updateBlob(DEFAULT_URL, new Blob(), "image/jpg");

    expect(getRequestDetails()).toMatchObject({ url: DEFAULT_URL, method: "PUT", xhrFields: { responseType: "blob" } });
    expect(getRequestHeaders()).toStrictEqual({ Accept: "image/jpg" });
  });

  test("stream request not supported", async () => {
    await expect(() => jqClient.getStream(DEFAULT_URL)).rejects.toThrow(
      "Streaming is not supported by the JqueryClient!"
    );
  });
});
