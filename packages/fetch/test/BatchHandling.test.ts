import { beforeEach, describe, expect, test, vi } from "vitest";
import { FetchClient } from "../src";

describe("FetchClient batch()", () => {
  let fetchClient: FetchClient;
  let requestConfig: RequestInit | undefined;

  const RESPONSE_TEXT =
    "--r\r\nContent-Type: application/http\r\nContent-ID: 0\r\n\r\n" +
    'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"value":[]}\r\n\r\n--r--\r\n';

  // @ts-ignore: more simplistic parameters and returning different stuff
  global.fetch = vi.fn((url: string, config?: RequestInit) => {
    requestConfig = config;
    return Promise.resolve({
      status: 200,
      statusText: "OK",
      ok: true,
      headers: new Headers({ "content-type": "multipart/mixed; boundary=r" }),
      text: () => Promise.resolve(RESPONSE_TEXT),
    });
  });

  beforeEach(() => {
    requestConfig = undefined;
    fetchClient = new FetchClient();
  });

  test("sends the multipart payload as-is and parses the multipart response", async () => {
    const body = { requests: [{ id: "0", method: "get" as const, url: "People" }] };
    const result = await fetchClient.batch("$batch", body);

    expect(requestConfig?.body).toContain("GET People HTTP/1.1");
    expect(requestConfig?.headers).toMatchObject({ "content-type": expect.stringContaining("multipart/mixed") });
    expect(result.data).toEqual({
      resolvedBy: "id",
      responses: [{ id: "0", status: 200, headers: { "content-type": "application/json" }, body: { value: [] } }],
    });
  });
});
