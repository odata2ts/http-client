import axios, { AxiosResponse, CreateAxiosDefaults, AxiosRequestConfig as OriginalRequestConfig } from "axios";

import { AxiosClient, AxiosRequestConfig } from "../src";

let axiosClient: AxiosClient;
let requestConfig: OriginalRequestConfig | undefined;
let simulateNoContent: boolean = false;

const DEFAULT_URL = "TEST/hi";
const JSON_VALUE = "application/json";
const DEFAULT_HEADERS = { Accept: JSON_VALUE, "Content-Type": JSON_VALUE };
const DEFAULT_RESPONSE_HEADERS = { accept: JSON_VALUE, "content-type": JSON_VALUE };
const SUCCESS_BODY = { Name: "Test" };

describe("Axios HTTP Client Tests", function () {
  // @ts-ignore
  axios.create = jest.fn(({ headers, ...defaultConfig }: CreateAxiosDefaults) => ({
    request: ({ headers: reqHeaders, ...config }: OriginalRequestConfig): Promise<Partial<AxiosResponse>> => {
      requestConfig = {
        headers: {
          ...headers,
          ...reqHeaders,
        },
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
      headers: DEFAULT_HEADERS,
      method: "GET",
    });
  });

  test("invalid url", async () => {
    await expect(
      // @ts-ignore
      axiosClient.get(null)
    ).rejects.toThrow("Value for URL must be provided!");
    await expect(
      // @ts-ignore
      axiosClient.get(undefined)
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
      headers: { ...DEFAULT_HEADERS, ...headers },
      method: "GET",
      ...config,
    });
  });

  test("using config with overrides", async () => {
    const headers = { Accept: "hey", "Content-Type": "Ho" };
    const config: AxiosRequestConfig = {
      // @ts-ignore: method is not exposed as it should not be overridden
      method: "POST",
    };

    await axiosClient.get("", { headers, ...config });

    // method has not been overridden
    expect(requestConfig?.method).toBe("GET");
    // headers have been overridden
    expect(requestConfig?.headers).toStrictEqual(headers);
  });

  test("post request", async () => {
    await axiosClient.post(DEFAULT_URL, {});

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: DEFAULT_HEADERS,
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
      headers: DEFAULT_HEADERS,
      method: "PUT",
      data: {},
    });
  });

  test("patch request", async () => {
    await axiosClient.patch(DEFAULT_URL, {});

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: DEFAULT_HEADERS,
      method: "PATCH",
      data: {},
    });
  });

  test("merge request", async () => {
    await axiosClient.merge(DEFAULT_URL, {});

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: { ...DEFAULT_HEADERS, "X-Http-Method": "MERGE" },
      method: "POST",
      data: {},
    });
  });

  test("delete request", async () => {
    await axiosClient.delete(DEFAULT_URL);

    expect(requestConfig).toStrictEqual({
      url: DEFAULT_URL,
      headers: DEFAULT_HEADERS,
      method: "DELETE",
    });
  });

  test("simulate 204 no content", async () => {
    simulateNoContent = true;
    const response = await axiosClient.post(DEFAULT_URL, {});

    expect(response.status).toBe(204);
    expect(response.data).toBeUndefined();
  });
});
