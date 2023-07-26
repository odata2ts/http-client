import axios, {
  AxiosError,
  AxiosResponse,
  CreateAxiosDefaults,
  InternalAxiosRequestConfig,
  AxiosRequestConfig as OriginalRequestConfig,
} from "axios";

import { AxiosClientError, AxiosRequestConfig, DEFAULT_ERROR_MESSAGE } from "../src";
import { AxiosClient } from "../src";

describe("Failure Handling Tests", function () {
  const RESPONSE_HEADERS = { "content-type": "application/json" };

  let axiosClient: AxiosClient;
  let requestConfig: OriginalRequestConfig | undefined;
  let simulateFailure: {
    isPlainError?: boolean;
    isRequestFailure?: boolean;
    isResponseFailure?: boolean;
    isEmptyBody?: boolean;
    message?: string;
    isV2?: boolean;
  } = {};

  // @ts-ignore
  axios.create = jest.fn(({ headers, ...defaultConfig }: CreateAxiosDefaults) => ({
    request: ({ headers: reqHeaders, ...config }: OriginalRequestConfig): Promise<Partial<AxiosResponse>> => {
      requestConfig = {
        headers: {
          ...headers,
          ...reqHeaders,
        },
        ...defaultConfig,
        ...config,
      } as AxiosRequestConfig;
      const { isPlainError, isRequestFailure, isResponseFailure, isEmptyBody, message, isV2 } = simulateFailure;
      let jsonResult = { error: { message: isV2 ? { value: message } : message } };

      if (isPlainError) {
        return Promise.reject(new Error(message));
      }
      if (isRequestFailure || isResponseFailure) {
        return Promise.reject(
          new AxiosError(message, undefined, undefined, isRequestFailure ? undefined : {}, undefined)
        );
      }

      return Promise.reject(
        new AxiosError(
          message,
          "00",
          requestConfig as InternalAxiosRequestConfig<any>,
          {},
          {
            status: 400,
            statusText: "Client Error!",
            request: requestConfig,
            headers: RESPONSE_HEADERS,
            data: isEmptyBody ? undefined : jsonResult,
            config: {} as InternalAxiosRequestConfig<any>,
          }
        )
      );
    },
  }));

  beforeEach(() => {
    axiosClient = new AxiosClient();
    requestConfig = undefined;
    simulateFailure = {};
  });

  test("failure response", async () => {
    simulateFailure.message = "oh no!";

    try {
      await axiosClient.get("");
    } catch (e) {
      expect(e).toBeInstanceOf(AxiosClientError);

      const error = e as AxiosClientError;
      expect(error.status).toBe(400);
      expect(error.headers).toStrictEqual(RESPONSE_HEADERS);
      expect(error.name).toBe("AxiosClientError");
      expect(error.message).toContain(simulateFailure.message);
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe(simulateFailure.message);
      expect(error.axiosError).toBeDefined();
      expect(error.axiosError!.isAxiosError).toBeTruthy();
      expect(error.stack).toContain(simulateFailure.message);
      expect(error.stack).toContain("AxiosClientError");
    }
  });

  test("generic failure message", async () => {
    simulateFailure.isEmptyBody = true;

    await expect(axiosClient.get("")).rejects.toThrow(DEFAULT_ERROR_MESSAGE);
  });

  test("failure message v2 support", async () => {
    simulateFailure = { isV2: true, message: "oh no!" };
    await expect(axiosClient.get("")).rejects.toThrow(simulateFailure.message);
  });

  test("request failure", async () => {
    simulateFailure = { isRequestFailure: true, message: "xxxyyyy Dddd!" };

    try {
      await axiosClient.get("");
    } catch (e) {
      expect(e).toBeInstanceOf(AxiosClientError);

      const error = e as AxiosClientError;
      expect(error.status).toBeUndefined();
      expect(error.headers).toBeUndefined();
      expect(error.name).toBe("AxiosClientError");
      expect(error.message).toContain(simulateFailure.message);
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe(simulateFailure.message);
      expect(error.stack).toContain(simulateFailure.message);
      expect(error.stack).toContain("AxiosClientError");
    }
  });

  test("request failure without message", async () => {
    simulateFailure = { isRequestFailure: true, message: undefined };
    await expect(axiosClient.get("")).rejects.toThrow(DEFAULT_ERROR_MESSAGE);
  });

  test("response failure", async () => {
    simulateFailure = { isResponseFailure: true, message: "xxxyyyy Dddd!" };

    try {
      await axiosClient.get("");
    } catch (e) {
      expect(e).toBeInstanceOf(AxiosClientError);

      const error = e as AxiosClientError;
      expect(error.status).toBeUndefined();
      expect(error.name).toBe("AxiosClientError");
      expect(error.message).toContain(simulateFailure.message);
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe(simulateFailure.message);
      expect(error.stack).toContain(simulateFailure.message);
      expect(error.stack).toContain("AxiosClientError");
    }
  });

  test("custom failure message retriever", async () => {
    simulateFailure.message = "the failure";
    const customMsg = "Here comes my failure!";
    axiosClient.setErrorMessageRetriever((response) => {
      const test = response?.error?.message;
      expect(test).toBe(simulateFailure.message);
      return customMsg;
    });

    await expect(axiosClient.get("")).rejects.toThrow(customMsg);
  });

  test("plain error", async () => {
    simulateFailure.isPlainError = true;
    simulateFailure.message = "the failure";

    await expect(axiosClient.get("")).rejects.toThrow(simulateFailure.message);
  });
});
