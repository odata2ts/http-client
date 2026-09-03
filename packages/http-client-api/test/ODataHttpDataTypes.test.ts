import { describe, expect, test } from "vitest";
import { ODataHttpDataTypes } from "../src";

/**
 * Every client compares the requested data type against these plain strings, partly without using
 * the enum at all, so the values are the contract between base client and implementations.
 */
describe("ODataHttpDataTypes Tests", function () {
  test("data type values", () => {
    expect(ODataHttpDataTypes.JSON).toBe("json");
    expect(ODataHttpDataTypes.BLOB).toBe("blob");
    expect(ODataHttpDataTypes.STREAM).toBe("stream");
    expect(ODataHttpDataTypes.TEXT).toBe("text");
  });
});
