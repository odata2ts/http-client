import { describe, expect, test } from "vitest";
import {
  buildHttpRequestMessage,
  parseHttpMessage,
  parseHttpResponseMessage,
  parseStatusLine,
} from "../../src/batch/HttpMessage";

describe("HttpMessage", () => {
  test("parses a request line with no headers and no body", () => {
    const { startLine, headers, body } = parseHttpMessage("GET Books?$top=1 HTTP/1.1\r\n\r\n");

    expect(startLine).toBe("GET Books?$top=1 HTTP/1.1");
    expect(headers).toEqual({});
    expect(body).toBe("");
  });

  test("parses headers and a body", () => {
    const raw = 'PATCH Members(1) HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"Name":"Batch Alice"}\r\n';
    const { headers, body } = parseHttpMessage(raw);

    expect(headers).toEqual({ "content-type": "application/json" });
    expect(body).toBe('{"Name":"Batch Alice"}\r\n');
  });

  test("parses a status line into status and statusText", () => {
    expect(parseStatusLine("HTTP/1.1 200 OK")).toEqual({ status: 200, statusText: "OK" });
    expect(parseStatusLine("HTTP/1.1 204 No Content")).toEqual({ status: 204, statusText: "No Content" });
  });

  test("parseHttpResponseMessage combines status line, headers and body", () => {
    const raw = 'HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{"value":[]}\r\n';

    expect(parseHttpResponseMessage(raw)).toEqual({
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      body: '{"value":[]}\r\n',
    });
  });

  test("buildHttpRequestMessage round-trips a bodyless GET exactly as the CAP capture shows it", () => {
    expect(buildHttpRequestMessage("get", "Books?$top=1", {})).toBe("GET Books?$top=1 HTTP/1.1\r\n\r\n");
  });

  test("buildHttpRequestMessage writes headers and a body", () => {
    const message = buildHttpRequestMessage(
      "patch",
      "Members(1)",
      { "Content-Type": "application/json" },
      '{"Name":"Batch Alice"}',
    );

    expect(message).toBe('PATCH Members(1) HTTP/1.1\r\nContent-Type: application/json\r\n\r\n{"Name":"Batch Alice"}');
  });
});
