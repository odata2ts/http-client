import { describe, expect, test } from "vitest";
import { retrieveErrorMessage } from "../src/ErrorMessageRetriever";
import { buildErrorMessage, DEFAULT_ERROR_MESSAGE, FAILURE_RESPONSE_MESSAGE } from "../src/ErrorMessages";

describe("ErrorMessages", () => {
  test("a string cause is used as it is", () => {
    expect(buildErrorMessage(FAILURE_RESPONSE_MESSAGE, "Not Found")).toBe(FAILURE_RESPONSE_MESSAGE + "Not Found");
  });

  test("an Error contributes its message", () => {
    expect(buildErrorMessage(FAILURE_RESPONSE_MESSAGE, new Error("boom"))).toBe(FAILURE_RESPONSE_MESSAGE + "boom");
  });

  test("anything without a message falls back", () => {
    for (const cause of [undefined, null, "", new Error(), { status: 500 }]) {
      expect(buildErrorMessage(FAILURE_RESPONSE_MESSAGE, cause)).toBe(FAILURE_RESPONSE_MESSAGE + DEFAULT_ERROR_MESSAGE);
    }
  });
});

describe("ErrorMessageRetriever", () => {
  test("V4 error document", () => {
    expect(retrieveErrorMessage({ error: { code: "404", message: "Not Found" } })).toBe("Not Found");
  });

  test("V2 error document", () => {
    expect(retrieveErrorMessage({ error: { code: "404", message: { lang: "en", value: "Not Found" } } })).toBe(
      "Not Found",
    );
  });

  test("nothing to retrieve", () => {
    expect(retrieveErrorMessage(undefined)).toBeUndefined();
    expect(retrieveErrorMessage({})).toBeUndefined();
    expect(retrieveErrorMessage({ error: {} })).toBeUndefined();
    expect(retrieveErrorMessage("plain text")).toBeUndefined();
  });
});
