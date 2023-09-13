import { HttpResponseModel, ODataHttpClient } from "@odata2ts/http-client-api";
import {
  BaseHttpClient,
  BaseHttpClientOptions,
  HttpMethods,
  InternalHttpClientConfig,
} from "@odata2ts/http-client-base";

import { FetchClientError } from "./FetchClientError";
import { FetchRequestConfig, getDefaultConfig, mergeFetchConfig } from "./FetchRequestConfig";

export interface ClientOptions extends BaseHttpClientOptions {}

export const DEFAULT_ERROR_MESSAGE = "No error message!";
const FETCH_FAILURE_MESSAGE = "OData request failed entirely: ";
const JSON_RETRIEVAL_FAILURE_MESSAGE = "Retrieving JSON body from OData response failed: ";
const RESPONSE_FAILURE_MESSAGE = "OData server responded with error: ";

function buildErrorMessage(prefix: string, error: any) {
  const msg = typeof error === "string" ? error : (error as Error)?.message;
  return prefix + (msg || DEFAULT_ERROR_MESSAGE);
}

export class FetchClient extends BaseHttpClient<FetchRequestConfig> implements ODataHttpClient<FetchRequestConfig> {
  protected readonly config: RequestInit;

  constructor(config?: FetchRequestConfig, clientOptions?: ClientOptions) {
    super(clientOptions);
    this.config = getDefaultConfig(config);
  }

  protected async executeRequest<ResponseModel>(
    method: HttpMethods,
    url: string,
    data: any,
    requestConfig: FetchRequestConfig | undefined = {},
    internalConfig: InternalHttpClientConfig = {}
  ): Promise<HttpResponseModel<ResponseModel>> {
    const { headers, noBodyEvaluation } = internalConfig;
    const { params, ...config } = mergeFetchConfig(this.config, { headers }, requestConfig);
    config.method = method;
    if (typeof data !== "undefined") {
      config.body = JSON.stringify(data);
    }
    let finalUrl = url;
    if (params && Object.values(params).length) {
      finalUrl +=
        (url.match(/\?/) ? "&" : "?") +
        // @ts-ignore
        new URLSearchParams(params).toString();
    }

    // the actual request
    let response: Response;
    try {
      response = await fetch(finalUrl, config);
    } catch (fetchError) {
      throw new FetchClientError(
        buildErrorMessage(FETCH_FAILURE_MESSAGE, fetchError),
        undefined,
        undefined,
        fetchError as Error
      );
    }

    // error response
    if (!response.ok) {
      let responseData = await this.getResponseBody(response, false);
      const errMsg = this.retrieveErrorMessage(responseData);

      throw new FetchClientError(
        buildErrorMessage(RESPONSE_FAILURE_MESSAGE, errMsg),
        response.status,
        this.mapHeaders(response.headers),
        new Error(errMsg || DEFAULT_ERROR_MESSAGE),
        response
      );
    }

    const responseData = noBodyEvaluation ? undefined : await this.getResponseBody(response, true);

    return {
      status: response.status,
      statusText: response.statusText,
      headers: this.mapHeaders(response.headers),
      data: responseData,
    };
  }

  protected async getResponseBody(response: Response, isFailedJsonFatal: boolean) {
    if (response.status === 204) {
      return undefined;
    }
    try {
      return await response.json();
    } catch (error) {
      if (isFailedJsonFatal) {
        throw new FetchClientError(
          buildErrorMessage(JSON_RETRIEVAL_FAILURE_MESSAGE, error),
          response.status,
          this.mapHeaders(response.headers),
          error as Error
        );
      }
      return undefined;
    }
  }

  protected mapHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => (result[key] = value));

    return result;
  }
}
