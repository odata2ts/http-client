import { describe, expect, test } from "vitest";
import { buildHttpRequestMessage } from "../../src/batch/HttpMessage";
import { buildMultipartBody, extractBoundary, generateBoundary, splitMultipart } from "../../src/batch/MimeMultipart";

// server/cap/test/batch-multipart.txt, byte for byte (CRLF line endings).
const CAP_CAPTURE =
  "--b\r\n" +
  "Content-Type: application/http\r\n" +
  "Content-Transfer-Encoding: binary\r\n" +
  "\r\n" +
  "GET Books?$top=1 HTTP/1.1\r\n" +
  "\r\n" +
  "\r\n" +
  "--b--\r\n";

describe("MimeMultipart", () => {
  test("generateBoundary produces distinct, prefixed values", () => {
    const a = generateBoundary("batch");
    const b = generateBoundary("batch");

    expect(a).toMatch(/^batch_/);
    expect(a).not.toBe(b);
  });

  test("extractBoundary reads the boundary out of a Content-Type header", () => {
    expect(extractBoundary("multipart/mixed; boundary=b")).toBe("b");
    expect(extractBoundary('multipart/mixed;boundary="my-boundary"')).toBe("my-boundary");
  });

  test("extractBoundary throws when there is none to find", () => {
    expect(() => extractBoundary("multipart/mixed")).toThrow();
    expect(() => extractBoundary(undefined)).toThrow();
  });

  test("splitMultipart parses the CAP capture into one part", () => {
    const parts = splitMultipart(CAP_CAPTURE, "b");

    expect(parts).toEqual([
      {
        headers: { "content-type": "application/http", "content-transfer-encoding": "binary" },
        body: "GET Books?$top=1 HTTP/1.1\r\n\r\n",
      },
    ]);
  });

  test("buildMultipartBody reproduces the CAP capture exactly", () => {
    const body = buildMultipartBody(
      [
        {
          headers: { "Content-Type": "application/http", "Content-Transfer-Encoding": "binary" },
          body: buildHttpRequestMessage("get", "Books?$top=1", {}),
        },
      ],
      "b",
    );

    expect(body).toBe(CAP_CAPTURE);
  });

  test("split(build(x)) round-trips multiple parts", () => {
    const parts = [
      { headers: { "content-type": "application/http", "content-id": "0" }, body: "GET People HTTP/1.1\r\n\r\n" },
      {
        headers: { "content-type": "application/http", "content-id": "1" },
        body: 'POST People HTTP/1.1\r\ncontent-type: application/json\r\n\r\n{"Name":"X"}',
      },
    ];
    const boundary = "r";

    expect(splitMultipart(buildMultipartBody(parts, boundary), boundary)).toEqual(parts);
  });
});
