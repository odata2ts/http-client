import { describe, expect, test } from "vitest";
import { DATA_MANIPULATION_METHODS, ODataHttpMethods } from "../src";

/**
 * The values go over the wire and are compared as plain strings by the clients, hence they are
 * part of the contract rather than an implementation detail.
 */
describe("ODataHttpMethods Tests", function () {
  test("http method values", () => {
    expect(ODataHttpMethods.Get).toBe("GET");
    expect(ODataHttpMethods.Post).toBe("POST");
    expect(ODataHttpMethods.Put).toBe("PUT");
    expect(ODataHttpMethods.Patch).toBe("PATCH");
    expect(ODataHttpMethods.Delete).toBe("DELETE");
  });

  test("data manipulation methods", () => {
    // this list decides which requests need a CSRF token, so GET must stay out of it
    expect(DATA_MANIPULATION_METHODS).toStrictEqual([
      ODataHttpMethods.Post,
      ODataHttpMethods.Put,
      ODataHttpMethods.Patch,
      ODataHttpMethods.Delete,
    ]);
    expect(DATA_MANIPULATION_METHODS).not.toContain(ODataHttpMethods.Get);
  });
});
