// @vitest-environment jsdom
import { beforeEach, describe, expect, test } from "vitest";
import { JQueryClient } from "../src";
import { JqMock } from "./JQueryMock";

describe("JQueryClient batch()", () => {
  let jqMock: JqMock;
  let jqClient: JQueryClient;

  const RESPONSE_TEXT =
    "--r\r\nContent-Type: application/http\r\nContent-ID: 0\r\n\r\n" +
    'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"value":[]}\r\n\r\n--r--\r\n';

  beforeEach(() => {
    jqMock = new JqMock();
    // @ts-ignore
    jqClient = new JQueryClient(jqMock);
  });

  test("sends the multipart payload as text and tells jQuery not to parse the response as JSON", async () => {
    jqMock.successResponse(RESPONSE_TEXT, { "content-type": "multipart/mixed; boundary=r" });

    const body = { requests: [{ id: "0", method: "get" as const, url: "People" }] };
    const result = await jqClient.batch("$batch", body);

    const sent = jqMock.getRequestConfig();
    expect(sent?.data).toContain("GET People HTTP/1.1");
    expect(sent?.dataType).toBe("text");
    expect(result.data).toEqual({
      resolvedBy: "id",
      responses: [{ id: "0", status: 200, headers: { "content-type": "application/json" }, body: { value: [] } }],
    });
  });
});
