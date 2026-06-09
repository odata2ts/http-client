import crypto from "crypto";
import {
  HttpResponseModel,
  ODataClientError,
  ODataHttpClient,
  ODataHttpClientOptions,
  ODataHttpMethods,
} from "@odata2ts/http-client-api";
import { BaseHttpClient, BaseRequestConfig } from "../src";

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

  public simulateClientFailure: boolean = false;
  public simulateTokenExpired: boolean = false;

  constructor(baseOptions?: ODataHttpClientOptions) {
    super(baseOptions);
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

    const responseHeaders: Record<string, string> = {};

    // CSRF token request => custom response
    if (mergedConfig?.headers && mergedConfig.headers[this.getCsrfTokenKey()] === "Fetch") {
      this.generatedCsrfToken = crypto.randomBytes(4).toString("hex");
      responseHeaders[this.getCsrfTokenKey()] = this.generatedCsrfToken;
    }

    if (this.simulateClientFailure) {
      this.simulateClientFailure = false;
      return Promise.reject(new MockClientError("Oh no!", 400, {}, new Error("oh damn!")));
    } else if (this.simulateTokenExpired) {
      this.simulateTokenExpired = false;
      return Promise.reject(new MockClientError("Token expired!", 403, { [this.getCsrfTokenKey()]: "Required" }));
    }

    return Promise.resolve({
      status: 200,
      statusText: "OK",
      headers: responseHeaders,
      data: {} as ResponseModel,
    });
  }
}
