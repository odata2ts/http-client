import { ODataHttpDataTypes } from "@odata2ts/http-client-api";
import { beforeEach, describe, expect, test } from "vitest";
import { MockHttpClient } from "./MockHttpClient";

describe("BaseHttpClient.batch()", () => {
  let mockClient: MockHttpClient;

  beforeEach(() => {
    mockClient = new MockHttpClient();
  });

  test("multipart batch: the payload is sent as raw text, the response is parsed", async () => {
    mockClient.simulateBatchResponse = {
      body:
        "--r\r\nContent-Type: application/http\r\nContent-ID: 0\r\n\r\n" +
        'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"value":[]}\r\n\r\n--r--\r\n',
      headers: { "content-type": "multipart/mixed; boundary=r" },
    };

    const body = { requests: [{ id: "0", method: "get" as const, url: "People" }] };
    const result = await mockClient.batch("$batch", body);

    expect(mockClient.lastInternalConfig?.dataType).toBe(ODataHttpDataTypes.TEXT);
    expect(mockClient.lastData).toContain("GET People HTTP/1.1");
    expect(result.data).toEqual({
      resolvedBy: "id",
      responses: [{ id: "0", status: 200, headers: { "content-type": "application/json" }, body: { value: [] } }],
    });
  });

  test("json batch: Content-Type/Accept are application/json, continueOnError sets Prefer", async () => {
    mockClient.simulateBatchResponse = {
      body: JSON.stringify({ responses: [{ id: "0", status: 200, body: { value: [] } }] }),
      headers: { "content-type": "application/json" },
    };

    const body = { requests: [{ id: "0", method: "get" as const, url: "People" }] };
    await mockClient.batch("$batch", body, undefined, undefined, { format: "json", continueOnError: true });

    expect(mockClient.lastData).toBe(JSON.stringify(body));
    expect(mockClient.lastInternalConfig?.headers).toMatchObject({
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "odata.continue-on-error",
    });
  });
});
