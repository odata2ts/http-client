import { ODataClientError, ODataHttpMethods } from "@odata2ts/http-client-api";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { CsrfTokenHandler, DEFAULT_CSRF_TOKEN_KEY } from "../src/CsrfTokenHandler";

describe("CsrfTokenHandler", () => {
  const OPTIONS = { useCsrfProtection: true, csrfTokenFetchUrl: "https://test.testing.com" };

  function expiredResponse(key: string = DEFAULT_CSRF_TOKEN_KEY): ODataClientError {
    return { name: "Error", status: 403, headers: { [key]: "Required" } };
  }

  let handler: CsrfTokenHandler;

  beforeEach(() => {
    handler = new CsrfTokenHandler(OPTIONS);
  });

  test("fail without csrfTokenFetchUrl", () => {
    expect(() => new CsrfTokenHandler({ useCsrfProtection: true })).toThrow("URL");
    expect(() => new CsrfTokenHandler({ useCsrfProtection: true, csrfTokenFetchUrl: "  " })).toThrow("URL");
  });

  test("no fetch URL required without protection", () => {
    expect(() => new CsrfTokenHandler({ useCsrfProtection: false })).not.toThrow();
  });

  test("token key", () => {
    expect(handler.getKey()).toBe(DEFAULT_CSRF_TOKEN_KEY);

    handler.setKey("X-My-Token");
    expect(handler.getKey()).toBe("X-My-Token");

    handler.setKey("");
    expect(handler.getKey()).toBe(DEFAULT_CSRF_TOKEN_KEY);
  });

  test("applies to data manipulation only", () => {
    expect(handler.appliesTo(ODataHttpMethods.Post)).toBe(true);
    expect(handler.appliesTo(ODataHttpMethods.Put)).toBe(true);
    expect(handler.appliesTo(ODataHttpMethods.Patch)).toBe(true);
    expect(handler.appliesTo(ODataHttpMethods.Delete)).toBe(true);
    expect(handler.appliesTo(ODataHttpMethods.Get)).toBe(false);
  });

  test("applies to nothing without protection", () => {
    const unprotected = new CsrfTokenHandler({ useCsrfProtection: false });

    expect(unprotected.appliesTo(ODataHttpMethods.Post)).toBe(false);
  });

  test("token is fetched once and cached", async () => {
    const fetchToken = vi.fn().mockResolvedValue("the-token");

    expect(await handler.getToken(fetchToken)).toBe("the-token");
    expect(await handler.getToken(fetchToken)).toBe("the-token");
    expect(fetchToken).toHaveBeenCalledTimes(1);
  });

  test("reset forces a new fetch", async () => {
    const fetchToken = vi.fn().mockResolvedValueOnce("first").mockResolvedValueOnce("second");

    expect(await handler.getToken(fetchToken)).toBe("first");
    handler.reset();
    expect(await handler.getToken(fetchToken)).toBe("second");
    expect(fetchToken).toHaveBeenCalledTimes(2);
  });

  test("expired token is detected", () => {
    expect(handler.isExpired(expiredResponse(), ODataHttpMethods.Post)).toBe(true);
  });

  test("no expiry for a read, another status or another header value", () => {
    expect(handler.isExpired(expiredResponse(), ODataHttpMethods.Get)).toBe(false);
    expect(handler.isExpired({ name: "Error", status: 401, headers: {} }, ODataHttpMethods.Post)).toBe(false);
    expect(handler.isExpired({ name: "Error", status: 403 }, ODataHttpMethods.Post)).toBe(false);
    expect(
      handler.isExpired(
        { name: "Error", status: 403, headers: { [DEFAULT_CSRF_TOKEN_KEY]: "" } },
        ODataHttpMethods.Post,
      ),
    ).toBe(false);
  });

  test("a custom key matches the lower-cased response header", () => {
    handler.setKey("X-My-Token");

    expect(handler.isExpired(expiredResponse("x-my-token"), ODataHttpMethods.Post)).toBe(true);
  });

  test("fetch URL is handed out", () => {
    expect(handler.getFetchUrl()).toBe(OPTIONS.csrfTokenFetchUrl);
  });
});
