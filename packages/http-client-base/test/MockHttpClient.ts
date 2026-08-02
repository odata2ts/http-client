import crypto from "crypto";
import {
  HttpResponseModel,
  ODataClientError,
  ODataHttpClient,
  ODataHttpClientOptions,
  ODataHttpMethods,
} from "@odata2ts/http-client-api";
import { BaseHttpClient, BaseRequestConfig } from "../src";

const MAX_FAILING_REQUESTS = 10;

export class MockClientError extends Error implements ODataClientError {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly headers?: Record<string, string>,
    public readonly cause?: Error,
  ) {
    // @ts-ignore
    super(message, { cause });
    this.name = this.constructor.name;
  }
}

export interface MockRequestConfig {
  headers?: Record<string, string>;
  dataType?: string;
  x?: string;
}

export class MockHttpClient extends BaseHttpClient<MockRequestConfig> implements ODataHttpClient<MockRequestConfig> {
  public generatedCsrfToken?: string;
  public lastMethod?: ODataHttpMethods;
  public lastUrl?: string;
  public lastData?: any;
  public lastConfig?: MockRequestConfig;
  public lastInternalConfig?: BaseRequestConfig;

  public requestCount: number = 0;

  public simulateClientFailure: boolean = false;
  public simulateTokenExpired: boolean = false;
  /**
   * Simulates a server which rejects the token no matter how often a new one is fetched.
   * After MAX_FAILING_REQUESTS it answers with a different error, so that a client which does not
   * limit its retries fails fast instead of looping forever.
   */
  public simulateTokenAlwaysExpired: boolean = false;

  constructor(baseOptions?: ODataHttpClientOptions) {
    super(baseOptions);
  }

  /**
   * Exposes the protected method, which extending clients use to decide upon JSON serialization.
   */
  public checkPlainTextBody(headers?: Record<string, string>) {
    return this.isPlainTextBody(headers);
  }

  public exposedErrorMessageRetriever(errorResponse: any) {
    return this.retrieveErrorMessage(errorResponse);
  }

  executeRequest<ResponseModel>(
    method: ODataHttpMethods,
    url: string,
    data: any,
    config: MockRequestConfig | undefined,
    internalConfig?: BaseRequestConfig,
  ): Promise<HttpResponseModel<ResponseModel>> {
    const mergedConfig: MockRequestConfig | undefined =
      config && internalConfig?.headers
        ? { ...config, headers: { ...config.headers, ...internalConfig.headers } }
        : internalConfig?.headers
          ? { headers: internalConfig.headers }
          : config;
    this.lastMethod = method;
    this.lastUrl = url;
    this.lastData = data;
    this.lastConfig = config;
    this.lastInternalConfig = internalConfig;
    this.requestCount++;

    const responseHeaders: Record<string, string> = {};

    // CSRF token request => custom response
    const isTokenFetch = mergedConfig?.headers && mergedConfig.headers[this.getCsrfTokenKey()] === "Fetch";
    if (isTokenFetch) {
      this.generatedCsrfToken = crypto.randomBytes(4).toString("hex");
      responseHeaders[this.getCsrfTokenKey()] = this.generatedCsrfToken;
    }

    if (this.simulateClientFailure) {
      this.simulateClientFailure = false;
      return Promise.reject(new MockClientError("Oh no!", 400, {}, new Error("oh damn!")));
    } else if (this.simulateTokenExpired || (this.simulateTokenAlwaysExpired && !isTokenFetch)) {
      this.simulateTokenExpired = false;
      return this.requestCount > MAX_FAILING_REQUESTS
        ? Promise.reject(new MockClientError("Too many requests!", 429, {}))
        : Promise.reject(new MockClientError("Token expired!", 403, { [this.getCsrfTokenKey()]: "Required" }));
    }

    return Promise.resolve({
      status: 200,
      statusText: "OK",
      headers: responseHeaders,
      data: {} as ResponseModel,
    });
  }
}
