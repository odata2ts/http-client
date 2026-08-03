import { describe, expect, test } from "vitest";
import { parseErrorResponseBody, retrieveErrorMessage } from "../src";

describe("parseErrorResponseBody Tests", function () {
  const ERROR_DOCUMENT = { error: { message: "Not Found" } };

  test("a Blob is decoded and parsed", async () => {
    // what a failing binary request leaves behind, in every client
    const result = await parseErrorResponseBody(new Blob([JSON.stringify(ERROR_DOCUMENT)]));

    expect(result).toStrictEqual(ERROR_DOCUMENT);
    expect(retrieveErrorMessage(result)).toBe("Not Found");
  });

  test("an unparsed string is parsed", async () => {
    const result = await parseErrorResponseBody(JSON.stringify(ERROR_DOCUMENT));

    expect(result).toStrictEqual(ERROR_DOCUMENT);
  });

  test("text which is not JSON is handed on as it is", async () => {
    // an OData V2 server answers in XML unless asked otherwise, and a binary request cannot ask;
    // parsing that is beyond this function, but the text is of more use to a caller than nothing
    const xml = "<error><message>Requested entity could not be found.</message></error>";

    expect(await parseErrorResponseBody(xml)).toBe(xml);
    expect(await parseErrorResponseBody(new Blob([xml]))).toBe(xml);
  });

  test("surrounding whitespace does not decide the outcome", async () => {
    expect(await parseErrorResponseBody(` \n${JSON.stringify(ERROR_DOCUMENT)}\n `)).toStrictEqual(ERROR_DOCUMENT);
    expect(await parseErrorResponseBody("  xml  ")).toBe("xml");
  });

  test("an empty body yields nothing", async () => {
    expect(await parseErrorResponseBody("")).toBeUndefined();
    expect(await parseErrorResponseBody("   ")).toBeUndefined();
    expect(await parseErrorResponseBody(new Blob([]))).toBeUndefined();
  });

  test("anything already parsed passes through untouched", async () => {
    // the ordinary JSON request: the client handed over an object, and it must stay that object
    expect(await parseErrorResponseBody(ERROR_DOCUMENT)).toBe(ERROR_DOCUMENT);
    expect(await parseErrorResponseBody(undefined)).toBeUndefined();
    expect(await parseErrorResponseBody(null)).toBeNull();
  });
});
