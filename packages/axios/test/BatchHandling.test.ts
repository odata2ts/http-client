import axios, { AxiosResponse, AxiosRequestConfig as OriginalRequestConfig } from "axios";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AxiosClient } from "../src";

describe("AxiosClient batch()", () => {
  let axiosClient: AxiosClient;
  let requestConfig: OriginalRequestConfig | undefined;

  const RESPONSE_TEXT =
    "--r\r\nContent-Type: application/http\r\nContent-ID: 0\r\n\r\n" +
    'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"value":[]}\r\n\r\n--r--\r\n';

  // @ts-ignore
  axios.create = vi.fn(() => ({
    request: (config: OriginalRequestConfig): Promise<Partial<AxiosResponse>> => {
      requestConfig = config;
      return Promise.resolve({
        status: 200,
        statusText: "OK",
        headers: { "content-type": "multipart/mixed; boundary=r" },
        data: RESPONSE_TEXT,
      });
    },
  }));

  beforeEach(() => {
    requestConfig = undefined;
    axiosClient = new AxiosClient();
  });

  test("sends the multipart payload as-is (axios never JSON-encodes a string body) and parses the response", async () => {
    const body = { requests: [{ id: "0", method: "get" as const, url: "People" }] };
    const result = await axiosClient.batch("$batch", body);

    expect(requestConfig?.data).toContain("GET People HTTP/1.1");
    expect(requestConfig?.responseType).toBe("text");
    expect(result.data).toEqual({
      resolvedBy: "id",
      responses: [{ id: "0", status: 200, headers: { "content-type": "application/json" }, body: { value: [] } }],
    });
  });
});
