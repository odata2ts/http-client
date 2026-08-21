// required so @angular/common/http's own Ivy-decorated classes can be loaded outside of an Angular CLI
// build - see the comment in AngularODataClient.test.ts for details.
import "@angular/compiler";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from "@angular/common/http";
import { ODataHttpClientOptions } from "@odata2ts/http-client-api";
import { of, throwError } from "rxjs";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AngularODataClient, DEFAULT_CSRF_TOKEN_KEY } from "../src/index.js";

const TOKEN = "abc-123";
const TOKEN_KEY = DEFAULT_CSRF_TOKEN_KEY;
const FETCH_URL = "https://test.testing.com";

describe("AngularODataClient Automatic CSRF Handling Tests", () => {
  let client: AngularODataClient;
  let requestCalls: Array<{ method: string; url: string; options: any }>;
  /** when true, the next request carrying a (non-"Fetch") csrf header fails once with 403 + "Required" */
  let requiredOnce: boolean;

  function buildClient(options: ODataHttpClientOptions = { useCsrfProtection: true, csrfTokenFetchUrl: FETCH_URL }) {
    const requestMock = vi.fn((method: string, url: string, options: any) => {
      requestCalls.push({ method, url, options });

      const headerKeys: string[] = options.headers.keys();
      const fetchKey = headerKeys.find((key) => options.headers.get(key) === "Fetch");
      if (fetchKey) {
        return of(
          new HttpResponse({
            status: 200,
            statusText: "OK",
            body: "",
            headers: new HttpHeaders({ [fetchKey]: TOKEN }),
          }),
        );
      }

      const tokenKey = headerKeys.find((key) => options.headers.get(key) === TOKEN);
      if (tokenKey && requiredOnce) {
        requiredOnce = false;
        return throwError(
          () => new HttpErrorResponse({ status: 403, headers: new HttpHeaders({ [tokenKey]: "Required" }) }),
        );
      }

      return of(
        new HttpResponse({ status: 200, statusText: "OK", body: { success: true }, headers: new HttpHeaders() }),
      );
    });

    const httpClientMock = {
      request: requestMock,
      get: vi.fn((url: string, opts: any) => requestMock("GET", url, opts)),
    } as unknown as HttpClient;

    return new AngularODataClient(httpClientMock, options);
  }

  beforeEach(() => {
    requestCalls = [];
    requiredOnce = false;
    client = buildClient();
  });

  test("token is fetched and added on a mutating request", async () => {
    await client.post("test", {});

    expect(requestCalls.map((c) => c.url)).toStrictEqual([FETCH_URL, "test"]);
    expect(requestCalls[0].options.headers.get(TOKEN_KEY)).toBe("Fetch");
    expect(requestCalls[1].options.headers.get(TOKEN_KEY)).toBe(TOKEN);
  });

  test("no token is fetched for GET requests", async () => {
    await client.get("test");

    expect(requestCalls.map((c) => c.url)).toStrictEqual(["test"]);
    expect(requestCalls[0].options.headers.get(TOKEN_KEY)).toBeNull();
  });

  test("token is cached across multiple mutating requests", async () => {
    await client.post("test", {});
    await client.put("test", {});
    await client.patch("test", {});
    await client.delete("test");

    // only one token fetch for all four mutating requests
    expect(requestCalls.map((c) => c.url)).toStrictEqual([FETCH_URL, "test", "test", "test", "test"]);
    for (const call of requestCalls.slice(1)) {
      expect(call.options.headers.get(TOKEN_KEY)).toBe(TOKEN);
    }
  });

  /**
   * Mirrors BaseHttpClient's handling of an expired token: a 403 response with the csrf header set to
   * "Required" clears the cached token and repeats the original request exactly once with a freshly
   * fetched one, rather than surfacing the 403 to the caller.
   */
  test("an expired token (403 + Required) is refetched and the request retried once", async () => {
    requiredOnce = true;

    const response = await client.post("test", {});

    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual({ success: true });
    // fetch, failing post, re-fetch, succeeding post
    expect(requestCalls.map((c) => c.url)).toStrictEqual([FETCH_URL, "test", FETCH_URL, "test"]);
  });

  test("a request is only ever retried once, so a server that keeps demanding a new token still fails", async () => {
    const httpClientMock = {
      request: vi.fn((method: string, url: string, options: any) => {
        requestCalls.push({ method, url, options });
        const headerKeys: string[] = options.headers.keys();
        const fetchKey = headerKeys.find((key) => options.headers.get(key) === "Fetch");

        return fetchKey
          ? of(new HttpResponse({ status: 200, body: "", headers: new HttpHeaders({ [fetchKey]: TOKEN }) }))
          : throwError(
              () => new HttpErrorResponse({ status: 403, headers: new HttpHeaders({ [TOKEN_KEY]: "Required" }) }),
            );
      }),
      get: vi.fn(),
    } as unknown as HttpClient;
    client = new AngularODataClient(httpClientMock, { useCsrfProtection: true, csrfTokenFetchUrl: FETCH_URL });

    await expect(client.post("test", {})).rejects.toThrow(/OData server responded with error/);
    // fetch, failing post, re-fetch, still-failing post - then it gives up
    expect(requestCalls.map((c) => c.url)).toStrictEqual([FETCH_URL, "test", FETCH_URL, "test"]);
  });

  test("missing csrfTokenFetchUrl throws immediately when constructing the client", () => {
    const httpClientMock = { request: vi.fn(), get: vi.fn() } as unknown as HttpClient;

    expect(() => new AngularODataClient(httpClientMock, { useCsrfProtection: true })).toThrow(
      /the URL must be supplied via attribute \[csrfTokenFetchUrl\]/,
    );
    expect(() => new AngularODataClient(httpClientMock, { useCsrfProtection: true, csrfTokenFetchUrl: "  " })).toThrow(
      /the URL must be supplied via attribute \[csrfTokenFetchUrl\]/,
    );
  });

  test("csrf protection is off by default", async () => {
    const httpClientMock = {
      request: vi.fn((method: string, url: string, options: any) => {
        requestCalls.push({ method, url, options });
        return of(new HttpResponse({ status: 200, body: {}, headers: new HttpHeaders() }));
      }),
      get: vi.fn(),
    } as unknown as HttpClient;

    client = new AngularODataClient(httpClientMock);
    await client.post("test", {});

    expect(requestCalls.map((c) => c.url)).toStrictEqual(["test"]);
  });

  test("a custom csrf token key is used both for fetching and for the request header", async () => {
    client.setCsrfTokenKey("X-Custom-Token");
    expect(client.getCsrfTokenKey()).toBe("X-Custom-Token");

    await client.post("test", {});

    expect(requestCalls[0].options.headers.get("X-Custom-Token")).toBe("Fetch");
    expect(requestCalls[1].options.headers.get("X-Custom-Token")).toBe(TOKEN);
  });

  test("blob uploads carry the csrf token, getBlob (GET) does not", async () => {
    await client.createBlob("test", new Blob(["a"]), "image/jpg");

    expect(requestCalls.map((c) => c.url)).toStrictEqual([FETCH_URL, "test"]);
    expect(requestCalls[1].options.headers.get(TOKEN_KEY)).toBe(TOKEN);

    requestCalls = [];
    await client.getBlob("test2");

    expect(requestCalls.map((c) => c.url)).toStrictEqual(["test2"]);
    expect(requestCalls[0].options.headers.get(TOKEN_KEY)).toBeNull();
  });
});
