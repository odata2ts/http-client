import { BatchRequestBody } from "@odata2ts/http-client-api";
import { describe, expect, test } from "vitest";
import { BatchCorrelationError } from "../../src/batch/BatchErrors";
import { parseBatchResponse } from "../../src/batch/parseBatchResponse";

describe("parseBatchResponse - json format", () => {
  const request: BatchRequestBody = {
    requests: [
      { id: "1", method: "get", url: "Media?$top=1&$select=Title" },
      { id: "2", method: "patch", url: "Members(1)", body: { Name: "Batch Alice" } },
    ],
  };

  const responseJson = {
    responses: [
      { id: "1", status: 200, headers: { "content-type": "application/json" }, body: { value: [{ Title: "X" }] } },
      { id: "2", status: 204 },
    ],
  };

  test('resolvedBy is always "id" for json batch (§19.5)', () => {
    const result = parseBatchResponse(responseJson, request, { format: "json" });
    expect(result.resolvedBy).toBe("id");
    expect(result.responses).toEqual(responseJson.responses);
  });

  test("accepts the response pre-parsed or as a raw JSON string", () => {
    const fromString = parseBatchResponse(JSON.stringify(responseJson), request, { format: "json" });
    expect(fromString).toEqual(parseBatchResponse(responseJson, request, { format: "json" }));
  });
});

describe("parseBatchResponse - multipart format", () => {
  test("a single top-level response, correlated by Content-ID", () => {
    const raw =
      "--r\r\n" +
      "Content-Type: application/http\r\n" +
      "Content-ID: 0\r\n" +
      "\r\n" +
      "HTTP/1.1 200 OK\r\n" +
      "Content-Type: application/json\r\n" +
      "\r\n" +
      '{"value":[{"Title":"X"}]}\r\n' +
      "\r\n--r--\r\n";
    const request: BatchRequestBody = { requests: [{ id: "0", method: "get", url: "Media?$top=1" }] };

    const result = parseBatchResponse(raw, request, {
      format: "multipart",
      contentType: "multipart/mixed; boundary=r",
    });

    expect(result.resolvedBy).toBe("id");
    expect(result.responses).toEqual([
      { id: "0", status: 200, headers: { "content-type": "application/json" }, body: { value: [{ Title: "X" }] } },
    ]);
  });

  test("falls back to request-order when a part carries no Content-ID", () => {
    const raw = "--r\r\n" + "Content-Type: application/http\r\n" + "\r\n" + "HTTP/1.1 200 OK\r\n\r\n" + "\r\n--r--\r\n";
    const request: BatchRequestBody = { requests: [{ id: "0", method: "get", url: "Media?$top=1" }] };

    const result = parseBatchResponse(raw, request, {
      format: "multipart",
      contentType: "multipart/mixed; boundary=r",
    });

    expect(result.resolvedBy).toBe("request-order");
    expect(result.responses).toEqual([{ id: "0", status: 200, headers: {}, body: undefined }]);
  });

  test("a change set that committed: one nested response per member, each correlated by Content-ID", () => {
    const changeSetBody =
      "--cs\r\n" +
      "Content-Type: application/http\r\n" +
      "Content-ID: 1\r\n" +
      "\r\n" +
      "HTTP/1.1 201 Created\r\n\r\n" +
      '{"Id":5}\r\n' +
      "\r\n--cs\r\n" +
      "Content-Type: application/http\r\n" +
      "Content-ID: 2\r\n" +
      "\r\n" +
      "HTTP/1.1 201 Created\r\n\r\n" +
      '{"Id":9}\r\n' +
      "\r\n--cs--\r\n";
    const raw = "--r\r\n" + "Content-Type: multipart/mixed; boundary=cs\r\n" + "\r\n" + changeSetBody + "\r\n--r--\r\n";
    const request: BatchRequestBody = {
      requests: [
        { id: "1", method: "post", url: "People", atomicityGroup: "g1", body: { Name: "A" } },
        { id: "2", method: "post", url: "Trips", atomicityGroup: "g1", body: { Name: "T" } },
      ],
    };

    const result = parseBatchResponse(raw, request, {
      format: "multipart",
      contentType: "multipart/mixed; boundary=r",
    });

    expect(result.resolvedBy).toBe("id");
    expect(result.responses).toEqual([
      { id: "1", status: 201, atomicityGroup: "g1", headers: {}, body: { Id: 5 } },
      { id: "2", status: 201, atomicityGroup: "g1", headers: {}, body: { Id: 9 } },
    ]);
  });

  test("a change set that rolled back: one error part expands into a synthesized 424 for every other member", () => {
    const raw =
      "--r\r\n" +
      "Content-Type: application/http\r\n" +
      "Content-ID: 1\r\n" +
      "\r\n" +
      "HTTP/1.1 400 Bad Request\r\n\r\n" +
      '{"error":{"message":"invalid"}}\r\n' +
      "\r\n--r--\r\n";
    const request: BatchRequestBody = {
      requests: [
        { id: "1", method: "post", url: "People", atomicityGroup: "g1", body: { Name: "A" } },
        { id: "2", method: "post", url: "Trips", atomicityGroup: "g1", body: { Name: "T" } },
      ],
    };

    const result = parseBatchResponse(raw, request, {
      format: "multipart",
      contentType: "multipart/mixed; boundary=r",
    });

    expect(result.responses).toEqual([
      { id: "1", status: 400, atomicityGroup: "g1", headers: {}, body: { error: { message: "invalid" } } },
      { id: "2", status: 424, atomicityGroup: "g1", headers: {}, body: undefined },
    ]);
  });

  test("a request with no part at all (processing stopped early) gets no response object", () => {
    const raw = "--r\r\nContent-Type: application/http\r\nContent-ID: 0\r\n\r\nHTTP/1.1 200 OK\r\n\r\n\r\n--r--\r\n";
    const request: BatchRequestBody = {
      requests: [
        { id: "0", method: "get", url: "People" },
        { id: "1", method: "get", url: "Trips" },
      ],
    };

    const result = parseBatchResponse(raw, request, {
      format: "multipart",
      contentType: "multipart/mixed; boundary=r",
    });

    expect(result.responses).toEqual([{ id: "0", status: 200, headers: {}, body: undefined }]);
  });

  test("throws when the response cannot be correlated with the request at all", () => {
    const raw =
      "--r\r\nContent-Type: application/http\r\nContent-ID: 0\r\n\r\nHTTP/1.1 200 OK\r\n\r\n\r\n" +
      "--r\r\nContent-Type: application/http\r\nContent-ID: 1\r\n\r\nHTTP/1.1 200 OK\r\n\r\n\r\n--r--\r\n";
    const request: BatchRequestBody = { requests: [{ id: "0", method: "get", url: "People" }] };

    expect(() =>
      parseBatchResponse(raw, request, { format: "multipart", contentType: "multipart/mixed; boundary=r" }),
    ).toThrow(BatchCorrelationError);
  });
});
