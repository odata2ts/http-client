import { HttpResponseModel } from "@odata2ts/http-client-api";
import { BaseHttpClient, BaseHttpClientOptions, HttpMethods } from "@odata2ts/http-client-base";

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

export class FetchClient extends BaseHttpClient<FetchRequestConfig> {
  protected readonly config: RequestInit;

  constructor(config?: FetchRequestConfig, private clientOptions?: ClientOptions) {
    super(clientOptions);
    this.config = getDefaultConfig(config);
  }

  addHeaderToRequestConfig(
    headers: Record<string, string>,
    config: FetchRequestConfig | undefined
  ): FetchRequestConfig {
    return mergeFetchConfig(config, { headers });
  }

  async executeRequest<ResponseModel>(
    method: HttpMethods,
    url: string,
    data: any,
    requestConfig: FetchRequestConfig | undefined = {}
  ): Promise<HttpResponseModel<ResponseModel>> {
    const config = mergeFetchConfig(this.config, requestConfig);
    if (typeof data !== "undefined") {
      config.body = this.prepareData(data);
    }

    // the actual request
    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (fetchError) {
      throw new FetchClientError(buildErrorMessage(FETCH_FAILURE_MESSAGE, fetchError), undefined, fetchError as Error);
    }

    // error response
    if (!response.ok) {
      // automatic CSRF token handling
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => (responseHeaders[key] = value));
      if (this.isRefreshNecessary(response.status, responseHeaders)) {
        // automatic CSRF token handling: token has been reset: perform the original request again
        return this.sendRequest<ResponseModel>(method, url, data, requestConfig);
      }

      let responseData = await this.getResponseBody(response, false);
      const errMsg = this.retrieveErrorMessage(responseData);

      throw new FetchClientError(
        buildErrorMessage(RESPONSE_FAILURE_MESSAGE, errMsg),
        response.status,
        new Error(errMsg || DEFAULT_ERROR_MESSAGE),
        response
      );
    }

    const responseData = await this.getResponseBody(response, true);

    // header
    // Impl Note: No entries prop available, otherwise as one liner Array.from(response.headers.entries)
    const headers: { [key: string]: string } = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      data: responseData,
    };
  }

  private async getResponseBody(response: Response, isFailedJsonFatal: boolean) {
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
          error as Error
        );
      }
      return undefined;
    }
  }

  private prepareData(data: any): string {
    return JSON.stringify(data);
  }
}
