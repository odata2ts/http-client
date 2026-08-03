import { beforeEach, describe, expect, test } from "vitest";
import { DEFAULT_ERROR_MESSAGE, JQueryClient, JQueryClientError } from "../src";
import { JqMock } from "./JQueryMock";

describe("JQueryClient Failure Handling Tests", function () {
  let jqMock: JqMock;
  let jqClient: JQueryClient;

  const DEFAULT_URL = "TEST/hi";
  const RESPONSE_HEADERS = { "content-type": "application/json" };

  function createFailureMsg(message: string, isV2: boolean = false) {
    return { error: { message: isV2 ? { value: message } : message } };
  }

  beforeEach(() => {
    jqMock = new JqMock();
    jqClient = new JQueryClient(jqMock as unknown as JQueryStatic);
  });

  test("failure response", async () => {
    const failMsg = "Oh no!";
    const failBodyMsg = "Testings!!!";
    jqMock.errorResponse(400, createFailureMsg(failBodyMsg), RESPONSE_HEADERS, failMsg);

    try {
      await jqClient.get(DEFAULT_URL);
    } catch (e) {
      expect(e).toBeInstanceOf(JQueryClientError);

      const error = e as JQueryClientError;
      expect(error.status).toBe(400);
      expect(error.headers).toStrictEqual(RESPONSE_HEADERS);
      expect(error.name).toBe("JQueryClientError");
      expect(error.message).toContain(failBodyMsg);
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe(failBodyMsg);
      expect(error.jqXHR).toBeDefined();
      expect(error.jqXHR!.status).toBe(400);
      expect(error.stack).toContain(failBodyMsg);
      expect(error.stack).toContain("JQueryClientError");
    }
  });

  test("other failure", async () => {
    const failMsg = "Oh no!";
    jqMock.errorResponse(400, undefined, RESPONSE_HEADERS, failMsg);

    try {
      await jqClient.get(DEFAULT_URL);
    } catch (e) {
      expect(e).toBeInstanceOf(JQueryClientError);

      const error = e as JQueryClientError;
      expect(error.name).toBe("JQueryClientError");
      expect(error.message).toContain(failMsg);
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe(failMsg);
      expect(error.jqXHR).toBeDefined();
    }
  });

  test("no error message at all", async () => {
    jqMock.errorResponse(400, undefined, RESPONSE_HEADERS);

    try {
      await jqClient.get(DEFAULT_URL);
    } catch (e) {
      expect(e).toBeInstanceOf(JQueryClientError);

      const error = e as JQueryClientError;
      expect(error.name).toBe("JQueryClientError");
      expect(error.message).toBe(DEFAULT_ERROR_MESSAGE);
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe(DEFAULT_ERROR_MESSAGE);
    }
  });

  test("failure message v2 support", async () => {
    const failMsg = "Oh no!!!";
    jqMock.errorResponse(400, createFailureMsg(failMsg, true));

    await expect(jqClient.get("")).rejects.toThrow(failMsg);
  });

  /**
   * A binary request is sent with `responseType: "blob"`, and XmlHttpRequest then offers neither
   * `responseText` nor anything jQuery could have parsed into `responseJSON`. The server's error
   * document sits in `response` as binary instead, where nobody looked - so every such failure came out
   * with whatever jQuery had thrown, never with what the server said.
   */
  describe("error response to a binary request", () => {
    function asBlob(body: object) {
      return new Blob([JSON.stringify(body)]);
    }

    test("the error document is decoded from the binary response", async () => {
      const failBodyMsg = "Testings!!!";
      jqMock.errorResponse(400, asBlob(createFailureMsg(failBodyMsg)), RESPONSE_HEADERS, "Oh no!");

      try {
        await jqClient.getBlob(DEFAULT_URL);
        expect.unreachable("the request should have failed");
      } catch (e) {
        const error = e as JQueryClientError;
        expect(error.status).toBe(400);
        expect(error.message).toContain(failBodyMsg);
        expect(error.cause?.message).toBe(failBodyMsg);
      }
    });

    test("v2 support included", async () => {
      const failMsg = "Oh no!!!";
      jqMock.errorResponse(400, asBlob(createFailureMsg(failMsg, true)), RESPONSE_HEADERS);

      await expect(jqClient.getBlob(DEFAULT_URL)).rejects.toThrow(failMsg);
    });

    test("a body which is not an error document leaves jQuery's own message", async () => {
      const failMsg = "Oh no!";
      jqMock.errorResponse(400, new Blob(["not an error document"]), RESPONSE_HEADERS, failMsg);

      await expect(jqClient.getBlob(DEFAULT_URL)).rejects.toThrow(failMsg);
    });
  });

  test("custom failure message retriever", async () => {
    const failMsg = "the failure";

    jqMock.errorResponse(400, { test: failMsg });
    jqClient.setErrorMessageRetriever((response) => {
      return response?.test;
    });

    await expect(jqClient.get("")).rejects.toThrow(failMsg);
  });
});
