import { ODataHttpMethods } from "@odata2ts/http-client-api";
import { describe, expect, test } from "vitest";
import {
  getDefaultJsonHeaders,
  getJsonHeaders,
  isPlainTextBody,
  JSON_MIME_TYPE,
  mergeHeaders,
} from "../src/RequestHeaders";

describe("RequestHeaders", () => {
  test("json headers with and without content type", () => {
    expect(getJsonHeaders(true)).toStrictEqual({ Accept: JSON_MIME_TYPE, "Content-Type": JSON_MIME_TYPE });
    expect(getJsonHeaders(false)).toStrictEqual({ Accept: JSON_MIME_TYPE });
  });

  test("a bodyless method declares no content type", () => {
    expect(getDefaultJsonHeaders(ODataHttpMethods.Get)).toStrictEqual({ Accept: JSON_MIME_TYPE });
    expect(getDefaultJsonHeaders(ODataHttpMethods.Delete)).toStrictEqual({ Accept: JSON_MIME_TYPE });
  });

  test("a method carrying a body declares one", () => {
    for (const method of [ODataHttpMethods.Post, ODataHttpMethods.Put, ODataHttpMethods.Patch]) {
      expect(getDefaultJsonHeaders(method)).toStrictEqual({
        Accept: JSON_MIME_TYPE,
        "Content-Type": JSON_MIME_TYPE,
      });
    }
  });

  test("plain text body detection, whatever the header is spelled like", () => {
    expect(isPlainTextBody({ "Content-Type": "text/plain" })).toBe(true);
    expect(isPlainTextBody({ "content-type": "text/plain;charset=UTF-8" })).toBe(true);
    expect(isPlainTextBody({ "CONTENT-TYPE": "TEXT/PLAIN" })).toBe(true);
  });

  test("no plain text body", () => {
    expect(isPlainTextBody()).toBe(false);
    expect(isPlainTextBody({})).toBe(false);
    expect(isPlainTextBody({ "Content-Type": JSON_MIME_TYPE })).toBe(false);
    expect(isPlainTextBody({ Accept: "text/plain" })).toBe(false);
  });

  test("of two content type spellings the last one wins", () => {
    expect(isPlainTextBody({ "Content-Type": JSON_MIME_TYPE, "content-type": "text/plain" })).toBe(true);
    expect(isPlainTextBody({ "content-type": "text/plain", "Content-Type": JSON_MIME_TYPE })).toBe(false);
  });

  test("later header layers win", () => {
    expect(
      mergeHeaders(
        { Accept: JSON_MIME_TYPE, "X-Custom": "default" },
        { "X-Custom": "additional" },
        { "X-Custom": "config" },
      ),
    ).toStrictEqual({ Accept: JSON_MIME_TYPE, "X-Custom": "config" });
  });

  test("undefined layers are skipped", () => {
    expect(mergeHeaders(undefined, { Accept: JSON_MIME_TYPE }, undefined)).toStrictEqual({ Accept: JSON_MIME_TYPE });
    expect(mergeHeaders()).toStrictEqual({});
  });
});
