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
const BLOB_RETRIEVAL_FAILURE_MESSAGE = "Retrieving blob from OData response failed: ";
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
    internalConfig: InternalHttpClientConfig = {},
  ): Promise<HttpResponseModel<ResponseModel>> {
    const { headers, noBodyEvaluation } = internalConfig;
    const { params, ...config } = mergeFetchConfig(this.config, { headers }, requestConfig);
    config.method = method;
    if (typeof data !== "undefined") {
      config.body = internalConfig.dataType === "json" ? JSON.stringify(data) : data;
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
        fetchError as Error,
      );
    }

    // error response
    if (!response.ok) {
      let responseData;
      try {
        responseData = await this.getResponseBody(response, internalConfig);
      } catch (e) {
        responseData = undefined;
      }
      const errMsg = this.retrieveErrorMessage(responseData);

      throw new FetchClientError(
        buildErrorMessage(RESPONSE_FAILURE_MESSAGE, errMsg),
        response.status,
        this.mapHeaders(response.headers),
        new Error(errMsg || DEFAULT_ERROR_MESSAGE),
        responseData,
      );
    }

    let responseData;
    try {
      responseData = noBodyEvaluation ? undefined : await this.getResponseBody(response, internalConfig);
    } catch (error) {
      const msg = internalConfig.dataType === "blob" ? BLOB_RETRIEVAL_FAILURE_MESSAGE : JSON_RETRIEVAL_FAILURE_MESSAGE;
      throw new FetchClientError(
        buildErrorMessage(msg, error),
        response.status,
        this.mapHeaders(response.headers),
        error as Error,
      );
    }

    return {
      status: response.status,
      statusText: response.statusText,
      headers: this.mapHeaders(response.headers),
      data: responseData,
    };
  }

  protected async getResponseBody(response: Response, options: InternalHttpClientConfig) {
    if (response.status === 204) {
      return undefined;
    }
    switch (options.dataType) {
      case "json":
        return response.json();
      case "blob":
        return response.blob();
      case "stream":
        return response.body;
    }

    return undefined;
  }

  protected mapHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => (result[key] = value));

    return result;
  }
}
