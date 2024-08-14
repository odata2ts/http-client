import { HttpResponseModel, ODataHttpClient, ODataResponse } from "@odata2ts/http-client-api";
import {
  BaseHttpClient,
  BaseHttpClientOptions,
  HttpMethods,
  InternalHttpClientConfig,
} from "@odata2ts/http-client-base";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponseHeaders,
  AxiosRequestConfig as OriginalRequestConfig,
  RawAxiosResponseHeaders,
} from "axios";
import { AxiosClientError } from "./AxiosClientError.js";
import { AxiosRequestConfig, mergeConfig } from "./AxiosRequestConfig.js";

export interface ClientOptions extends BaseHttpClientOptions {}

export const DEFAULT_ERROR_MESSAGE = "No error message!";
const FAILURE_NO_RESPONSE = "No response from server! Failure: ";
const FAILURE_NO_REQUEST = "No request was sent! Failure: ";
const FAILURE_RESPONSE_MESSAGE = "OData server responded with error: ";
const FAILURE_AXIOS = "Fatal Axios failure: ";

function buildErrorMessage(prefix: string, error: any) {
  const msg = typeof error === "string" ? error : (error as Error)?.message;
  return prefix + (msg || DEFAULT_ERROR_MESSAGE);
}

export class AxiosClient extends BaseHttpClient<AxiosRequestConfig> implements ODataHttpClient<AxiosRequestConfig> {
  protected readonly client: AxiosInstance;

  constructor(config?: AxiosRequestConfig, clientOptions?: ClientOptions) {
    super(clientOptions);
    this.client = axios.create(config);
  }

  protected async executeRequest<ResponseModel>(
    method: HttpMethods,
    url: string,
    data: any,
    requestConfig: AxiosRequestConfig | undefined = {},
    internalConfig: InternalHttpClientConfig = {},
  ): Promise<HttpResponseModel<ResponseModel>> {
    // add URL, HTTP method and additional headers to the request config
    const { headers } = internalConfig;
    const config: OriginalRequestConfig = mergeConfig({ headers }, requestConfig, { url, method });
    if (typeof data !== "undefined") {
      config.data = data;
    }

    if (internalConfig.dataType && internalConfig.dataType !== "json") {
      config.responseType = internalConfig.dataType;
    }

    try {
      return await this.client.request(config);
    } catch (error: any) {
      if ((error as AxiosError).isAxiosError) {
        const axiosError = error as AxiosError;

        // regular failure handling
        if (axiosError.response) {
          const errMsg = this.retrieveErrorMessage(axiosError.response.data);
          const msg = buildErrorMessage(FAILURE_RESPONSE_MESSAGE, errMsg);
          throw new AxiosClientError(
            msg,
            axiosError.response.status,
            this.mapHeaders(axiosError.response.headers),
            new Error(errMsg || DEFAULT_ERROR_MESSAGE),
            axiosError,
          );
        }
        // fatal failure without response
        else {
          throw new AxiosClientError(
            buildErrorMessage(axiosError.request ? FAILURE_NO_RESPONSE : FAILURE_NO_REQUEST, axiosError),
            undefined,
            undefined,
            error,
            axiosError,
          );
        }
      }
      // not an Axios error
      throw new AxiosClientError(buildErrorMessage(FAILURE_AXIOS, error), undefined, undefined, error);
    }
  }

  protected mapHeaders(headers: AxiosResponseHeaders | RawAxiosResponseHeaders): Record<string, string> {
    return headers as Record<string, string>;
  }
}
