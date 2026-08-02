import { describe, expect, test } from "vitest";
// not exported via index, hence the direct import - the clients reach for it the same way
import { ODataHttpDataTypes } from "../src/ODataHttpDataTypes";

/**
 * Every client compares the requested data type against these plain strings, partly without using
 * the enum at all, so the values are the contract between base client and implementations.
 */
describe("ODataHttpDataTypes Tests", function () {
  test("data type values", () => {
    expect(ODataHttpDataTypes.JSON).toBe("json");
    expect(ODataHttpDataTypes.BLOB).toBe("blob");
    expect(ODataHttpDataTypes.STREAM).toBe("stream");
  });
});
