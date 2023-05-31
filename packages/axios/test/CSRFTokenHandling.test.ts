import crypto from "crypto";

import axios, { AxiosRequestConfig } from "axios";
import { AxiosResponse, CreateAxiosDefaults, AxiosRequestConfig as OriginalRequestConfig } from "axios/index";

import { AxiosClient } from "../src";

describe("Automatic CSRF Handling Test", function () {
  let client: AxiosClient;
  let requestUrl: string | undefined;
  let requestConfig: AxiosRequestConfig | undefined;
  let csrfToken: string | undefined;
  let simulateExpiredCsrfToken: boolean = false;
  let simulateNoResponse: boolean = false;

  const successResponse = {
    success: true,
  };
  const getTokenFromRequest = () => {
    const headers = requestConfig?.headers;
    return headers ? headers["x-csrf-token"] : undefined;
  };

  // @ts-ignore:
  axios.create = jest.fn((param: any) => ({
    request: (config: OriginalRequestConfig): Promise<Partial<AxiosResponse>> => {
      requestConfig = config;
      const reqHeaders = config.headers || {};

      let status = 200;
      let statusText = "OK";
      let data: any = successResponse;
      const headers: Record<string, string> = {};

      // CSRF token request => custom response
      if (getTokenFromRequest() === "Fetch") {
        csrfToken = crypto.randomBytes(4).toString("hex");
        headers["x-csrf-token"] = csrfToken;
        data = undefined;
      }
      // Simulate expired CSRF token => custom response
      else if (simulateExpiredCsrfToken || simulateNoResponse) {
        simulateExpiredCsrfToken = false;
        return Promise.reject({
          isAxiosError: true,
          message: "My Bad!",
          response: simulateNoResponse
            ? undefined
            : {
                status: 403,
                statusText: "Forbidden",
                headers: {
                  "x-csrf-token": "Required",
                },
              },
        });
      }

      return Promise.resolve({
        status,
        statusText,
        headers,
        data,
      });
    },
  }));

  beforeEach(() => {
    requestUrl = undefined;
    requestConfig = undefined;
    csrfToken = undefined;
    simulateExpiredCsrfToken = false;
    client = new AxiosClient(undefined, {
      useCsrfProtection: true,
      csrfTokenFetchUrl: "/root/",
    });
  });

  test("fail without csrfTokenFetchUrl", async () => {
    expect(() => new AxiosClient(undefined, { useCsrfProtection: true })).toThrow("URL");
  });

  test("added generated token", async () => {
    await client.post("test", {});

    expect(csrfToken).toBeTruthy();
    expect(getTokenFromRequest()).toBe(csrfToken);
  });

  test("no token generation for GET requests", async () => {
    const response = await client.get("test");

    expect(csrfToken).toBeUndefined();
    expect(response.headers["x-csrf-token"]).toBeUndefined();
  });

  test("token generation for PUT, PATCH, DELETE and caching", async () => {
    await client.put("test", {});
    const token = csrfToken;
    expect(getTokenFromRequest()).toBe(token);

    await client.patch("test", {});
    expect(getTokenFromRequest()).toBe(token);

    await client.delete("test");
    expect(getTokenFromRequest()).toBe(token);
  });

  test("token expiration", async () => {
    await client.post("test", {});
    const token = csrfToken;

    simulateExpiredCsrfToken = true;
    await client.post("test", {});
    const token2 = csrfToken;

    expect(token2).toBeTruthy();
    expect(token).not.toBe(token2);
  });

  test("don't trigger token expiration", async () => {
    simulateNoResponse = true;
    await expect(client.post("test", {})).rejects.toThrow("My Bad!");
  });
});
