import { AjaxRequestConfig, JQueryClient, JQueryClientError } from "../src";
import { DEFAULT_ERROR_MESSAGE } from "../src/JQueryClient";
import { JqMock } from "./JQueryMock";

describe("JQueryClient Failure Handling Tests", function () {
  let jqMock: JqMock;
  let jqClient: JQueryClient;

  const DEFAULT_URL = "TEST/hi";
  const JSON_VALUE = "application/json";
  const DEFAULT_HEADERS = { Accept: JSON_VALUE, "Content-Type": JSON_VALUE };
  const DEFAULT_REQUEST_CONFIG: AjaxRequestConfig = { timeout: 666, headers: { test: "test" } };
  const RESPONSE_HEADERS = { "content-type": "application/json" };

  const DEFAULT_CONFIG = {
    url: DEFAULT_URL,
    method: "GET",
    dataType: "json",
    cache: false,
  };

  const getRequestData = () => {
    return jqMock.getRequestConfig()?.data;
  };

  const getRequestHeaders = () => {
    return jqMock.getRequestConfig()?.headers;
  };

  /**
   * request config without headers
   */
  const getRequestDetails = () => {
    const { data, headers, success, error, ...result } = jqMock.getRequestConfig() || {};
    return result;
  };

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

  test("custom failure message retriever", async () => {
    const failMsg = "the failure";

    jqMock.errorResponse(400, { test: failMsg });
    jqClient.setErrorMessageRetriever((response) => {
      return response?.test;
    });

    await expect(jqClient.get("")).rejects.toThrow(failMsg);
  });
});
