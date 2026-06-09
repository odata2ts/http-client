import {
  HttpResponseModel,
  ODataHttpClient,
  ODataHttpClientOptions,
  ODataHttpMethods,
} from "@odata2ts/http-client-api";
import { ODataHttpDataTypes } from "@odata2ts/http-client-api/lib/ODataHttpDataTypes";
import { BaseHttpClient, BaseRequestConfig } from "@odata2ts/http-client-base";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponseHeaders,
  AxiosRequestConfig as OriginalRequestConfig,
  RawAxiosResponseHeaders,
} from "axios";
import { AxiosClientError } from "./AxiosClientError";
import { AxiosRequestConfig, mergeConfig } from "./AxiosRequestConfig";

export const DEFAULT_ERROR_MESSAGE = "No error message!";
const FAILURE_NO_RESPONSE = "No response from server! Failure: ";
const FAILURE_NO_REQUEST = "No request was sent! Failure: ";
const FAILURE_RESPONSE_MESSAGE = "OData server responded with error: ";
const FAILURE_AXIOS = "Fatal Axios failure: ";

function buildErrorMessage(prefix: string, error: any) {
  const msg = typeof error === "string" ? error : (error as Error)?.message;
  return prefix + (msg || DEFAULT_ERROR_MESSAGE);
}

interface InternalRequestConfig
  extends AxiosRequestConfig,
    Pick<OriginalRequestConfig, "method" | "url" | "responseType"> {}

export class AxiosClient extends BaseHttpClient<AxiosRequestConfig> implements ODataHttpClient<AxiosRequestConfig> {
  protected readonly client: AxiosInstance;

  constructor(config?: AxiosRequestConfig, clientOptions?: ODataHttpClientOptions) {
    super(clientOptions);
    this.client = axios.create(config);
  }

  protected async executeRequest<ResponseModel>(
    method: ODataHttpMethods,
    url: string,
    data: any,
    requestConfig: AxiosRequestConfig | undefined = {},
    internalConfig: BaseRequestConfig = {},
  ): Promise<HttpResponseModel<ResponseModel>> {
    const { headers } = internalConfig;

    // set core inputs for request
    const resultConfig: InternalRequestConfig = {
      ...mergeConfig({ headers }, requestConfig),
      url,
      method,
    };
    if (typeof data !== "undefined") {
      resultConfig.data = data;
    }
    if (internalConfig.dataType && internalConfig.dataType !== ODataHttpDataTypes.JSON) {
      resultConfig.responseType = internalConfig.dataType;
    }

    try {
      return await this.client.request(resultConfig);
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
