import axios, { AxiosResponse, CreateAxiosDefaults, AxiosRequestConfig as OriginalRequestConfig } from "axios";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AxiosClient, AxiosRequestConfig } from "../src";

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

  test("get blob request", async () => {
    await axiosClient.getBlob(DEFAULT_URL);

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: undefined,
      responseType: "blob",
      method: "GET",
    });
  });

  test("update blob request", async () => {
    const data = new Blob(["a"]);
    const mimeType = "image/jpg";
    await axiosClient.updateBlob(DEFAULT_URL, data, mimeType);

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: { Accept: JSON_VALUE, "Content-Type": mimeType },
      method: "PUT",
      responseType: "blob",
      data,
    });
  });

  test("stream request not supported", async () => {
    await axiosClient.getStream(DEFAULT_URL);

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: undefined,
      method: "GET",
      responseType: "stream",
    });
  });
});
