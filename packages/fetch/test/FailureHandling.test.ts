import { DEFAULT_ERROR_MESSAGE, FetchClient, FetchClientError, FetchRequestConfig } from "../src";

describe("Failure Handling Tests", function () {
  const RESPONSE_HEADERS = { "content-type": "application/json" };
  let fetchClient: FetchClient;
  let requestConfig: RequestInit | undefined;
  let simulateFailure: {
    isFetchFailure?: boolean;
    isJsonFailure?: boolean;
    message?: string;
    isV2?: boolean;
    isOk?: boolean;
  } = {};

  // @ts-ignore: more simplistic parameters and returning different stuff
  global.fetch = jest.fn((url: string, config?: RequestInit | undefined): Promise<MockResponse> => {
    // store last request config
    requestConfig = config;

    const { isFetchFailure, isV2, isOk, isJsonFailure, message } = simulateFailure;
    let jsonResult = { error: { message: isV2 ? { value: message } : message } };

    const headers = new Headers(RESPONSE_HEADERS);
    return isFetchFailure
      ? Promise.reject(new Error(message))
      : Promise.resolve({
          status: isOk ? 200 : 400,
          statusText: "Client error",
          headers,
          ok: !!isOk,
          json: () => (isJsonFailure ? Promise.reject(new Error(message)) : Promise.resolve(jsonResult)),
        });
  });

  beforeEach(() => {
    requestConfig = undefined;
    fetchClient = new FetchClient();
    simulateFailure = {};
  });

  test("failure response", async () => {
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
    }
  });

  // when the whole request failed, any failures that occur on calling the json function are non-fatal
  test("failure request and json retrieval failure", async () => {
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
