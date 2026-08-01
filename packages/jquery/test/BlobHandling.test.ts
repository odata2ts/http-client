// @vitest-environment jsdom

import jquery from "jquery";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { JQueryClient } from "../src";

const DEFAULT_URL = "/test/blob";
const MIME_TYPE = "text/csv";
const CONTENT = "hello world";

interface SentRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: any;
}

let sentRequest: SentRequest;

/**
 * Minimal XHR replacement which records the request and answers with 204.
 */
class XhrRecorder {
  private method: string = "";
  private url: string = "";
  private readonly headers: Record<string, string> = {};

  public readyState = 4;
  public status = 204;
  public statusText = "No Content";
  public response: any = undefined;
  public responseText = "";
  public onload: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public onabort: (() => void) | null = null;
  public ontimeout: (() => void) | null = null;
  public onreadystatechange: (() => void) | null = null;

  public open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  public setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }

  public getAllResponseHeaders() {
    return "";
  }

  public abort() {}

  public send(body: any) {
    sentRequest = { method: this.method, url: this.url, headers: this.headers, body };
    this.onload?.();
  }
}

/**
 * Binary uploads only work if the blob is handed to jQuery untouched: JSON serializing it would yield "{}",
 * while jQuery's processData (true by default) would turn it into a query string.
 * Hence these tests exercise the real jQuery, mocking out only the XHR itself.
 *
 * See https://github.com/odata2ts/odata2ts/issues/421.
 */
describe("Blob Handling Tests", function () {
  const originalXhr = window.XMLHttpRequest;
  let jqClient: JQueryClient;

  beforeEach(() => {
    // @ts-ignore: only the parts jQuery actually uses are implemented
    window.XMLHttpRequest = XhrRecorder;
    jqClient = new JQueryClient(jquery);
  });

  afterEach(() => {
    window.XMLHttpRequest = originalXhr;
  });

  test("create blob", async () => {
    const blob = new Blob([CONTENT], { type: MIME_TYPE });

    await jqClient.createBlob(DEFAULT_URL, blob, MIME_TYPE);

    expect(sentRequest.method).toBe("POST");
    expect(sentRequest.headers["Content-Type"]).toBe(MIME_TYPE);
    expect(sentRequest.body).toBe(blob);
    await expect(sentRequest.body.text()).resolves.toBe(CONTENT);
  });

  test("update blob", async () => {
    const blob = new Blob([CONTENT], { type: MIME_TYPE });

    await jqClient.updateBlob(DEFAULT_URL, blob, MIME_TYPE);

    expect(sentRequest.method).toBe("PUT");
    expect(sentRequest.url).toMatch(DEFAULT_URL);
    expect(sentRequest.headers["Content-Type"]).toBe(MIME_TYPE);
    expect(sentRequest.body).toBe(blob);
    await expect(sentRequest.body.text()).resolves.toBe(CONTENT);
  });

  test("regular request still gets serialized as JSON", async () => {
    const data = { test: "hey", collection: [{ hey: 3 }] };

    await jqClient.post(DEFAULT_URL, data);

    expect(sentRequest.headers["Content-Type"]).toBe("application/json");
    expect(sentRequest.body).toBe(JSON.stringify(data));
  });
});
