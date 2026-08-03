import { beforeEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_ERROR_MESSAGE, FetchClient, FetchClientError } from "../src";

describe("Failure Handling Tests", function () {
  const RESPONSE_HEADERS = { "content-type": "application/json" };
  let fetchClient: FetchClient;
  let requestConfig: RequestInit | undefined;
  let simulateFailure: {
    isFetchFailure?: boolean;
    isJsonFailure?: boolean;
    isBlobFailure?: boolean;
    message?: string;
    isV2?: boolean;
    isOk?: boolean;
    /** The error body as the server sends it, for the cases where it is not an OData error document. */
    rawBody?: string;
  } = {};

  // @ts-ignore: more simplistic parameters and returning different stuff
  global.fetch = vi.fn((url: string, config?: RequestInit | undefined): Promise<MockResponse> => {
    // store last request config
    requestConfig = config;

    const { isFetchFailure, isV2, isOk, isJsonFailure, isBlobFailure, message, rawBody } = simulateFailure;
    let jsonResult = { error: { message: isV2 ? { value: message } : message } };
    const bodyText = rawBody ?? JSON.stringify(jsonResult);

    const headers = new Headers(RESPONSE_HEADERS);
    return isFetchFailure
      ? Promise.reject(new Error(message))
      : Promise.resolve({
          status: isOk ? 200 : 400,
          statusText: "Client error",
          headers,
          ok: !!isOk,
          json: () => (isJsonFailure ? Promise.reject(new Error(message)) : Promise.resolve(jsonResult)),
          // the error path reads the body as text, whatever the request asked for
          text: () => (isJsonFailure ? Promise.reject(new Error(message)) : Promise.resolve(bodyText)),
          blob: () => (isBlobFailure ? Promise.reject(new Error(message)) : Promise.resolve(new Blob(["a"]))),
        });
  });

  beforeEach(() => {
    requestConfig = undefined;
    fetchClient = new FetchClient();
    simulateFailure = {};
  });

  test("failure response", async () => {
    simulateFailure.isOk = false;
    simulateFailure.message = "oh no!";

    try {
      await fetchClient.get("");
    } catch (e) {
      expect(e).toBeInstanceOf(FetchClientError);

      const error = e as FetchClientError;
      expect(error.status).toBe(400);
      expect(error.headers).toStrictEqual(RESPONSE_HEADERS);
      expect(error.name).toBe("FetchClientError");
      expect(error.message).toContain(simulateFailure.message);
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe(simulateFailure.message);
      expect(error.stack).toContain(simulateFailure.message);
      expect(error.stack).toContain("FetchClientError");
      expect(error.responseData).toStrictEqual({ error: { message: simulateFailure.message } });
    }
  });

  test("generic failure message", async () => {
    await expect(fetchClient.get("")).rejects.toThrow(DEFAULT_ERROR_MESSAGE);
  });

  test("failure message v2 support", async () => {
    simulateFailure = { isV2: true, message: "oh no!" };
    await expect(fetchClient.get("")).rejects.toThrow(simulateFailure.message);
  });

  test("fetch failure", async () => {
    simulateFailure = { isFetchFailure: true, message: "xxxyyyy Dddd!" };

    try {
      await fetchClient.get("");
    } catch (e) {
      expect(e).toBeInstanceOf(FetchClientError);

      const error = e as FetchClientError;
      expect(error.status).toBeUndefined();
      expect(error.headers).toBeUndefined();
      expect(error.name).toBe("FetchClientError");
      expect(error.message).toContain(simulateFailure.message);
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe(simulateFailure.message);
      expect(error.stack).toContain(simulateFailure.message);
      expect(error.stack).toContain("FetchClientError");
      expect(error.responseData).toBeUndefined();
    }
  });

  test("fetch failure without message", async () => {
    simulateFailure = { isFetchFailure: true, message: undefined };
    await expect(fetchClient.get("")).rejects.toThrow(DEFAULT_ERROR_MESSAGE);
  });

  test("json retrieval failure", async () => {
    simulateFailure = { isJsonFailure: true, isOk: true, message: "xxxyyyy Dddd!" };

    try {
      await fetchClient.get("");
    } catch (e) {
      expect(e).toBeInstanceOf(FetchClientError);

      const error = e as FetchClientError;
      expect(error.status).toBe(200);
      expect(error.name).toBe("FetchClientError");
      expect(error.message).toContain(simulateFailure.message);
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe(simulateFailure.message);
      expect(error.stack).toContain(simulateFailure.message);
      expect(error.stack).toContain("FetchClientError");
      expect(error.responseData).toBeUndefined();
    }
  });

  test("blob retrieval failure", async () => {
    simulateFailure = { isBlobFailure: true, isOk: true, message: "xxxyyyy Dddd!" };

    try {
      await fetchClient.getBlob("");
      expect.unreachable("retrieving the blob should have failed");
    } catch (e) {
      expect(e).toBeInstanceOf(FetchClientError);

      const error = e as FetchClientError;
      expect(error.status).toBe(200);
      // the failure is named after what could not be read, not after the default of json
      expect(error.message).toContain("Retrieving blob from OData response failed: ");
      expect(error.message).toContain(simulateFailure.message);
      expect(error.cause?.message).toBe(simulateFailure.message);
    }
  });

  // when the whole request failed, any failures that occur on reading the response body are non-fatal
  test("failure request and body retrieval failure", async () => {
    simulateFailure = { isJsonFailure: true, isOk: false, message: "xxxyyyy Dddd!" };

    try {
      await fetchClient.get("");
    } catch (e) {
      expect(e).toBeInstanceOf(FetchClientError);

      const error = e as FetchClientError;
      expect(error.status).toBe(400);
      expect(error.name).toBe("FetchClientError");
      expect(error.message).toContain(DEFAULT_ERROR_MESSAGE);
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe(DEFAULT_ERROR_MESSAGE);
    }
  });

  /**
   * What the request asked for says nothing about the failure: a server answers a `getBlob` or a
   * `getStream` with an ordinary OData error document. Reading that document the way the successful
   * payload would have been read - as a Blob, or by handing the unread stream on - left every failure of
   * a binary request reporting the client's default message.
   */
  describe("error response to a binary request", () => {
    test("a failing getBlob reports the server's message", async () => {
      simulateFailure = { message: "oh no!" };

      try {
        await fetchClient.getBlob("");
        expect.unreachable("the request should have failed");
      } catch (e) {
        const error = e as FetchClientError;
        expect(error.status).toBe(400);
        expect(error.message).toContain(simulateFailure.message);
        expect(error.cause?.message).toBe(simulateFailure.message);
        // and the document itself is passed on, not the Blob it arrived in
        expect(error.responseData).toStrictEqual({ error: { message: simulateFailure.message } });
      }
    });

    test("a failing getStream reports the server's message", async () => {
      simulateFailure = { isV2: true, message: "oh no!" };

      await expect(fetchClient.getStream("")).rejects.toThrow(simulateFailure.message);
    });

    test("a failing updateBlob reports the server's message", async () => {
      simulateFailure = { message: "oh no!" };

      await expect(fetchClient.updateBlob("", new Blob(["a"]), "application/epub+zip")).rejects.toThrow(
        simulateFailure.message,
      );
    });

    test("a body which is not JSON is passed on as text", async () => {
      // An OData V2 server answers in XML unless asked otherwise, and a binary request cannot ask: its
      // response is bytes, not JSON. Parsing that is beyond the default retriever, so the message stays
      // the fallback - but the document reaches the caller instead of being lost in a Blob.
      simulateFailure = { rawBody: "<error><message>Requested entity could not be found.</message></error>" };

      try {
        await fetchClient.getBlob("");
        expect.unreachable("the request should have failed");
      } catch (e) {
        const error = e as FetchClientError;
        expect(error.message).toContain(DEFAULT_ERROR_MESSAGE);
        expect(error.responseData).toBe(simulateFailure.rawBody);
      }
    });

    test("an empty body yields no data at all", async () => {
      simulateFailure = { rawBody: "" };

      try {
        await fetchClient.getBlob("");
        expect.unreachable("the request should have failed");
      } catch (e) {
        const error = e as FetchClientError;
        expect(error.message).toContain(DEFAULT_ERROR_MESSAGE);
        expect(error.responseData).toBeUndefined();
      }
    });
  });

  test("custom failure message retriever", async () => {
    simulateFailure.message = "the failure";
    const customMsg = "Here comes my failure!";
    fetchClient.setErrorMessageRetriever((response) => {
      expect(response.error.message).toBe(simulateFailure.message);
      return customMsg;
    });

    await expect(fetchClient.get("")).rejects.toThrow(customMsg);
  });
});
