import { FetchClient, FetchRequestConfig } from "../src";

describe("FetchClient Tests", function () {
  let fetchClient: FetchClient;
  let requestUrl: string | undefined;
  let requestConfig: RequestInit | undefined;
  let simulateNoContent: boolean = false;

  const DEFAULT_URL = "TEST/hi";
  const DEFAULT_REQUEST_CONFIG = { method: "GET", cache: "no-store" };
  const DEFAULT_BLOB = new Blob(["a", "b"]);
  const DEFAULT_STREAM = "aba";

  // Mocking fetch
  // @ts-ignore: more simplistic parameters and returning different stuff
  global.fetch = jest.fn((url: string, config?: RequestInit | undefined): Promise<MockResponse> => {
    // store last request url
    requestUrl = url;
    // store last request config
    requestConfig = config;

    let jsonResult = simulateNoContent ? undefined : { success: true };

    return Promise.resolve({
      status: simulateNoContent ? 204 : 200,
      statusText: "OK",
      headers: new Headers(),
      ok: true,
      body: DEFAULT_STREAM,
      json: () => Promise.resolve(jsonResult),
      blob: () => Promise.resolve(DEFAULT_BLOB),
    });
  });

  const getDefaultBaseConfigForMethod = (method: string) => {
    return {
      ...DEFAULT_REQUEST_CONFIG,
      method,
      body: "{}",
    };
  };

  const getRequestHeaderRecords = () => {
    const headers = requestConfig?.headers as Headers;
    const result: Record<string, string> = {};

    headers.forEach((val, key) => (result[key] = val));
    return result;
  };

  /**
   * request config without headers
   */
  const getBaseRequestConfig = () => {
    const { headers, ...result } = requestConfig || {};

    return result;
  };

  beforeEach(() => {
    requestUrl = undefined;
    requestConfig = undefined;
    fetchClient = new FetchClient();
    simulateNoContent = false;
  });

  test("get request", async () => {
    await fetchClient.get(DEFAULT_URL);

    expect(requestUrl).toBe(DEFAULT_URL);
    expect(getBaseRequestConfig()).toStrictEqual(DEFAULT_REQUEST_CONFIG);
    expect(getRequestHeaderRecords()).toStrictEqual({});
  });

  test("invalid url", async () => {
    await expect(
      // @ts-ignore
      fetchClient.get(null)
    ).rejects.toThrow("Value for URL must be provided!");
    await expect(
      // @ts-ignore
      fetchClient.get(undefined)
    ).rejects.toThrow("Value for URL must be provided!");
  });

  test("using config", async () => {
    const headers = { hey: "Ho" };
    const config: FetchRequestConfig = {
      referrerPolicy: "unsafe-url",
      redirect: "error",
      mode: "cors",
      credentials: "include",
    };

    await fetchClient.get("", { headers, ...config });

    expect(getBaseRequestConfig()).toStrictEqual({ ...DEFAULT_REQUEST_CONFIG, ...config });
    expect(getRequestHeaderRecords()).toStrictEqual(headers);
  });

  test("using additional headers", async () => {
    const headers = { hey: "Ho" };

    await fetchClient.get("", undefined, headers);

    expect(getRequestHeaderRecords()).toStrictEqual(headers);
  });

  test("request config overrides everything", async () => {
    const headers = { Accept: "hey", "Content-Type": "Ho", test: "test" };
    const config: FetchRequestConfig = {
      // @ts-ignore: method is not exposed as it should not be overridden
      method: "POST",
      cache: "force-cache",
    };

    await fetchClient.get("", { headers, ...config }, { test: "added" });

    // method has not been overridden
    expect(getBaseRequestConfig()).toStrictEqual({ method: "GET", cache: config.cache });
    // headers have been overridden
    expect(getRequestHeaderRecords()).toStrictEqual({
      accept: headers.Accept,
      "content-type": headers["Content-Type"],
      test: "test",
    });
  });

  test("post request", async () => {
    await fetchClient.post(DEFAULT_URL, {});

    expect(requestUrl).toBe(DEFAULT_URL);
    expect(getBaseRequestConfig()).toStrictEqual(getDefaultBaseConfigForMethod("POST"));
    expect(getRequestHeaderRecords()).toStrictEqual({});
  });

  test("post request with different data", async () => {
    await fetchClient.post("", undefined);
    expect(requestConfig?.body).toBeUndefined();
    await fetchClient.post("", null);
    expect(requestConfig?.body).toStrictEqual("null");
    await fetchClient.post("", "");
    expect(requestConfig?.body).toStrictEqual('""');
    const dataStructure = { test: "hey", collection: [{ hey: 3 }] };
    await fetchClient.post("", dataStructure);
    expect(requestConfig?.body).toBe(JSON.stringify(dataStructure));
  });

  test("put request", async () => {
    await fetchClient.put(DEFAULT_URL, {});

    expect(requestUrl).toBe(DEFAULT_URL);
    expect(getBaseRequestConfig()).toStrictEqual(getDefaultBaseConfigForMethod("PUT"));
  });

  test("patch request", async () => {
    await fetchClient.patch(DEFAULT_URL, {});

    expect(requestUrl).toBe(DEFAULT_URL);
    expect(getBaseRequestConfig()).toStrictEqual(getDefaultBaseConfigForMethod("PATCH"));
  });

  test("delete request", async () => {
    await fetchClient.delete(DEFAULT_URL);

    expect(requestUrl).toBe(DEFAULT_URL);
    expect(getBaseRequestConfig()).toStrictEqual({ ...DEFAULT_REQUEST_CONFIG, method: "DELETE" });
  });

  test("simulate 204 no content", async () => {
    simulateNoContent = true;
    const response = await fetchClient.post(DEFAULT_URL, {});

    expect(response.status).toBe(204);
    expect(response.data).toBeUndefined();
  });

  test("using params in request config", async () => {
    const params = { hey: "Ho", a: 111, list: ["a", "b"] };

    await fetchClient.get("test", { params });

    expect(getBaseRequestConfig()).toStrictEqual(DEFAULT_REQUEST_CONFIG);
    expect(requestUrl).toStrictEqual("test?hey=Ho&a=111&list=a%2Cb");

    await fetchClient.get("test?x=y", { params });
    expect(requestUrl).toStrictEqual("test?x=y&hey=Ho&a=111&list=a%2Cb");
  });

  test("using global params", async () => {
    const params = { hey: "Ho", a: 111, list: ["a", "b"] };
    fetchClient = new FetchClient({ params });

    await fetchClient.get("test");

    expect(getBaseRequestConfig()).toStrictEqual(DEFAULT_REQUEST_CONFIG);
    expect(requestUrl).toStrictEqual("test?hey=Ho&a=111&list=a%2Cb");

    await fetchClient.get("test?x=y");
    expect(requestUrl).toStrictEqual("test?x=y&hey=Ho&a=111&list=a%2Cb");
  });

  test("get blob request", async () => {
    const response = await fetchClient.getBlob(DEFAULT_URL);

    expect(response.status).toBe(200);
    expect(requestUrl).toBe(DEFAULT_URL);
    expect(response.data).toBe(DEFAULT_BLOB);
    expect(getBaseRequestConfig()).toStrictEqual(DEFAULT_REQUEST_CONFIG);
    expect(getRequestHeaderRecords()).toStrictEqual({});
  });

  test("update blob request", async () => {
    const mimeType = "image/jpg";
    const response = await fetchClient.updateBlob(DEFAULT_URL, DEFAULT_BLOB, mimeType);

    expect(response.status).toBe(200);
    expect(requestUrl).toBe(DEFAULT_URL);
    expect(getBaseRequestConfig()).toStrictEqual({ ...DEFAULT_REQUEST_CONFIG, method: "PUT", body: DEFAULT_BLOB });
    expect(getRequestHeaderRecords()).toStrictEqual({ accept: mimeType, "content-type": mimeType });
  });

  test("get stream request", async () => {
    const response = await fetchClient.getStream(DEFAULT_URL);

    expect(response.status).toBe(200);
    expect(requestUrl).toBe(DEFAULT_URL);
    expect(response.data).toBe(DEFAULT_STREAM);
    expect(getBaseRequestConfig()).toStrictEqual(DEFAULT_REQUEST_CONFIG);
    expect(getRequestHeaderRecords()).toStrictEqual({});
  });
});
