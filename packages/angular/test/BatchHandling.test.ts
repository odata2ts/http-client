import "@angular/compiler";
import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { of } from "rxjs";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AngularODataClient } from "../src/index.js";

describe("AngularODataClient batch()", () => {
  let client: AngularODataClient;
  let requestMock: ReturnType<typeof vi.fn>;
  let lastCall: { method: string; url: string; options: any } | undefined;

  const RESPONSE_TEXT =
    "--r\r\nContent-Type: application/http\r\nContent-ID: 0\r\n\r\n" +
    'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"value":[]}\r\n\r\n--r--\r\n';

  beforeEach(() => {
    lastCall = undefined;
    requestMock = vi.fn((method: string, url: string, options: any) => {
      lastCall = { method, url, options };
      return of(
        // a real server picks its own response boundary, unrelated to the request's - never echo
        // `options.headers` here, or this stops testing anything once the request boundary is random
        new HttpResponse({
          status: 200,
          statusText: "OK",
          body: RESPONSE_TEXT,
          headers: new HttpHeaders({ "content-type": "multipart/mixed; boundary=r" }),
        }),
      );
    });

    const httpClientMock = { request: requestMock } as unknown as HttpClient;
    client = new AngularODataClient(httpClientMock);
  });

  test("posts the multipart payload as text and parses the response", async () => {
    const body = { requests: [{ id: "0", method: "get" as const, url: "People" }] };
    const result = await client.batch("$batch", body);

    expect(lastCall?.method).toBe("POST");
    expect(lastCall?.url).toBe("$batch");
    expect(lastCall?.options.body).toContain("GET People HTTP/1.1");
    expect(lastCall?.options.responseType).toBe("text");
    expect(lastCall?.options.headers.get("Content-Type")).toMatch(/^multipart\/mixed; boundary=/);
    expect(result.data).toEqual({
      resolvedBy: "id",
      responses: [{ id: "0", status: 200, headers: { "content-type": "application/json" }, body: { value: [] } }],
    });
  });
});
