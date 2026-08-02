import axios, { AxiosResponse, CreateAxiosDefaults, AxiosRequestConfig as OriginalRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AxiosClient, AxiosRequestConfig, FAILURE_BLOB_UNSUPPORTED, FAILURE_STREAM_UNSUPPORTED } from "../src";

const DEFAULT_URL = "TEST/hi";
const JSON_VALUE = "application/json";
const DEFAULT_GET_HEADERS = { Accept: JSON_VALUE };
const DEFAULT_EDIT_HEADERS = { ...DEFAULT_GET_HEADERS, "Content-Type": JSON_VALUE };
const DEFAULT_RESPONSE_HEADERS = { accept: JSON_VALUE, "content-type": JSON_VALUE };
const SUCCESS_BODY = { Name: "Test" };

describe("Axios HTTP Client Tests", function () {
  let axiosClient: AxiosClient;
  let requestConfig: OriginalRequestConfig | undefined;
  let simulateNoContent: boolean = false;

  // @ts-ignore
  axios.create = vi.fn(({ headers, ...defaultConfig }: CreateAxiosDefaults = {}) => ({
    request: ({ headers: reqHeaders, ...config }: OriginalRequestConfig): Promise<Partial<AxiosResponse>> => {
      requestConfig = {
        headers:
          headers || (reqHeaders && Object.keys(reqHeaders).length)
            ? {
                ...headers,
                ...reqHeaders,
              }
            : undefined,
        ...defaultConfig,
        ...config,
      } as AxiosRequestConfig;

      return Promise.resolve({
        status: simulateNoContent ? 204 : 200,
        statusText: "OK",
        request: requestConfig,
        headers: DEFAULT_RESPONSE_HEADERS,
        data: simulateNoContent ? undefined : SUCCESS_BODY,
      });
    },
  }));

  beforeEach(() => {
    requestConfig = undefined;
    simulateNoContent = false;
    axiosClient = new AxiosClient();
  });

  test("get request", async () => {
    await axiosClient.get(DEFAULT_URL);

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: DEFAULT_GET_HEADERS,
      method: "GET",
    });
  });

  test("invalid url", async () => {
    await expect(
      // @ts-ignore
      axiosClient.get(null),
    ).rejects.toThrow("Value for URL must be provided!");
    await expect(
      // @ts-ignore
      axiosClient.get(undefined),
    ).rejects.toThrow("Value for URL must be provided!");
  });

  test("using config", async () => {
    const headers = { "User-Agent": "Ho" };
    const config: AxiosRequestConfig = {
      baseURL: "/test",
      decompress: true,
    };

    await axiosClient.get("", { headers, ...config });

    expect(requestConfig).toStrictEqual({
      url: "",
      headers: { ...DEFAULT_GET_HEADERS, ...headers },
      method: "GET",
      ...config,
    });
  });

  test("using additional headers", async () => {
    const headers = { hey: "Ho" };

    await axiosClient.get("", undefined, headers);

    expect(requestConfig?.headers).toStrictEqual({ ...DEFAULT_GET_HEADERS, ...headers });
  });

  test("request config overrides everything", async () => {
    axiosClient = new AxiosClient({ headers: { Accept: "bbb", mo: "mi" } });
    const headers = { Accept: "hey", "Content-Type": "Ho", test: "test" };
    const config: AxiosRequestConfig = {
      // @ts-ignore: method is not exposed as it should not be overridden
      method: "POST",
    };

    await axiosClient.get("", { headers, ...config }, { test: "added", extra: "x" });

    // method has not been overridden
    expect(requestConfig?.method).toBe("GET");
    // headers have been overridden
    expect(requestConfig?.headers).toStrictEqual({ ...headers, mo: "mi", extra: "x" });
  });

  test("post request", async () => {
    await axiosClient.post(DEFAULT_URL, {});

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: DEFAULT_EDIT_HEADERS,
      method: "POST",
      data: {},
    });
  });

  test("post request with different data", async () => {
    await axiosClient.post("", undefined);
    expect(requestConfig?.data).toBeUndefined();
    await axiosClient.post("", null);
    expect(requestConfig?.data).toBeNull();
    await axiosClient.post("", "");
    expect(requestConfig?.data).toBe("");
    const dataStructure = { test: "hey", collection: [{ hey: 3 }] };
    await axiosClient.post("", dataStructure);
    expect(requestConfig?.data).toStrictEqual(dataStructure);
  });

  /**
   * Axios serializes the body itself and leaves strings alone, so this client never suffered from the
   * double quoting of https://github.com/odata2ts/odata2ts/issues/383. Pinned to keep it that way.
   */
  test("post request with plain text body", async () => {
    const query = "%24select=UserName&%24top=10";

    await axiosClient.post("", query, undefined, { "Content-Type": "text/plain" });

    expect(requestConfig?.data).toBe(query);
  });

  test("put request", async () => {
    await axiosClient.put(DEFAULT_URL, {});

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: DEFAULT_EDIT_HEADERS,
      method: "PUT",
      data: {},
    });
  });

  test("patch request", async () => {
    await axiosClient.patch(DEFAULT_URL, {});

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: DEFAULT_EDIT_HEADERS,
      method: "PATCH",
      data: {},
    });
  });

  test("delete request", async () => {
    await axiosClient.delete(DEFAULT_URL);

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: { Accept: "application/json" },
      method: "DELETE",
    });
  });

  test("simulate 204 no content", async () => {
    simulateNoContent = true;
    const response = await axiosClient.post(DEFAULT_URL, {});

    expect(response.status).toBe(204);
    expect(response.data).toBeUndefined();
  });

  /**
   * Binary data is the one area where the two axios adapters differ in what they can deliver at all, so
   * these tests state which environment they are in: `XMLHttpRequest` is what axios picks the adapter by.
   * Vitest runs in Node here, hence no XHR unless a test stubs one in.
   */
  describe("binary data", () => {
    const blobHeaders = { Accept: JSON_VALUE, "Content-Type": "image/jpg" };

    function simulateBrowser() {
      vi.stubGlobal("XMLHttpRequest", class {});
    }

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    test("get blob request in the browser", async () => {
      simulateBrowser();

      await axiosClient.getBlob(DEFAULT_URL);

      expect(requestConfig).toStrictEqual({
        url: DEFAULT_URL,
        headers: undefined,
        responseType: "blob",
        method: "GET",
      });
    });

    test("get blob request is refused without XMLHttpRequest", async () => {
      // The http adapter decodes the response as text, so it would hand back a string where the API
      // declares a Blob - a lie the compiler cannot catch, hence the refusal.
      await expect(axiosClient.getBlob(DEFAULT_URL)).rejects.toThrow(FAILURE_BLOB_UNSUPPORTED);
      expect(requestConfig).toBeUndefined();
    });

    test("update blob request in the browser", async () => {
      simulateBrowser();
      const data = new Blob(["a"]);

      await axiosClient.updateBlob(DEFAULT_URL, data, "image/jpg");

      expect(requestConfig).toStrictEqual({
        url: DEFAULT_URL,
        headers: blobHeaders,
        method: "PUT",
        responseType: "blob",
        data,
      });
    });

    test("uploading a blob works without XMLHttpRequest, as long as nothing binary comes back", async () => {
      // Sending is fine on either adapter, and the usual answer is 204 - refusing this would break a
      // working upload path for Node users.
      simulateNoContent = true;
      const data = new Blob(["a"]);

      const response = await axiosClient.updateBlob(DEFAULT_URL, data, "image/jpg");

      expect(response.status).toBe(204);
      expect(requestConfig).toMatchObject({ method: "PUT", responseType: "blob", data });
    });

    test("a blob coming back from a write is refused without XMLHttpRequest", async () => {
      // Here the server does answer with content: that response can only be a string, so it is refused
      // rather than passed on as a pseudo-Blob.
      await expect(axiosClient.updateBlob(DEFAULT_URL, new Blob(["a"]), "image/jpg")).rejects.toThrow(
        FAILURE_BLOB_UNSUPPORTED,
      );
    });

    test("sending a stream is refused as well", async () => {
      // Unlike a blob, a stream cannot even be sent: the http adapter does not accept a ReadableStream
      // as request body, and the XHR adapter cannot stream in the first place.
      const data = new Blob(["a"]).stream();

      await expect(axiosClient.createStream(DEFAULT_URL, data, "image/jpg")).rejects.toThrow(
        FAILURE_STREAM_UNSUPPORTED,
      );

      simulateBrowser();
      await expect(axiosClient.updateStream(DEFAULT_URL, data, "image/jpg")).rejects.toThrow(
        FAILURE_STREAM_UNSUPPORTED,
      );

      expect(requestConfig).toBeUndefined();
    });

    test("streaming is refused in either environment", async () => {
      // Not an environment question at all: the XHR adapter cannot stream, and the http adapter returns a
      // Node.js stream where the API declares a ReadableStream.
      await expect(axiosClient.getStream(DEFAULT_URL)).rejects.toThrow(FAILURE_STREAM_UNSUPPORTED);

      simulateBrowser();
      await expect(axiosClient.getStream(DEFAULT_URL)).rejects.toThrow(FAILURE_STREAM_UNSUPPORTED);

      expect(requestConfig).toBeUndefined();
    });
  });
});
