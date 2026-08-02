import {
  HttpResponseModel,
  ODataHttpClient,
  ODataHttpClientOptions,
  ODataHttpDataTypes,
  ODataHttpMethods,
} from "@odata2ts/http-client-api";
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

export const FAILURE_STREAM_UNSUPPORTED =
  "Streaming is not supported by the AxiosClient! Its XHR adapter cannot stream at all, and its http " +
  "adapter neither accepts a ReadableStream as request body nor yields one as response. " +
  "Use the FetchClient for streams.";
export const FAILURE_BLOB_UNSUPPORTED =
  "Binary responses are not supported by the AxiosClient outside the browser! Without XMLHttpRequest " +
  "axios falls back to its http adapter, which decodes the response as text - so a Blob can never be " +
  "delivered. Use the FetchClient for binary data.";

function buildErrorMessage(prefix: string, error: any) {
  const msg = typeof error === "string" ? error : (error as Error)?.message;
  return prefix + (msg || DEFAULT_ERROR_MESSAGE);
}

/**
 * Whether axios will use its XHR adapter, which is the only one of the two that can deliver a `Blob`.
 *
 * Asked as a question about the environment rather than about the configured adapter on purpose: axios
 * picks the adapter itself, and the presence of `XMLHttpRequest` is exactly what that choice comes down
 * to. Without it the http adapter takes over and hands back a string, which is the failure this guards.
 */
function hasBinaryCapableAdapter(): boolean {
  return typeof XMLHttpRequest !== "undefined";
}

/**
 * Whether the response carried no body worth looking at - 204 leaves axios with an empty string.
 */
function isEmpty(data: unknown): boolean {
  return data === undefined || data === null || data === "";
}

interface InternalRequestConfig
  extends AxiosRequestConfig, Pick<OriginalRequestConfig, "method" | "url" | "responseType"> {}

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
    internalConfig: BaseRequestConfig,
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

    /*
     * Refuse what this client cannot deliver, instead of returning something that merely looks like it.
     * Passing `responseType` through was silently wrong: `stream` yielded a Node.js stream where the API
     * declares a `ReadableStream`, and `blob` a plain string where it declares a `Blob`. Both satisfy the
     * compiler and fail at the first `.text()` or `.getReader()` - far away from the cause.
     */
    // covers both directions: reading a stream as well as sending one as request body
    if (internalConfig.dataType === ODataHttpDataTypes.STREAM) {
      throw new AxiosClientError(FAILURE_STREAM_UNSUPPORTED);
    }
    // Sending binary data works on either adapter, so only a request expecting binary *back* is refused
    // up front; a write is checked afterwards, once it is known whether a body came back at all.
    if (internalConfig.dataType === ODataHttpDataTypes.BLOB && !hasBinaryCapableAdapter() && data === undefined) {
      throw new AxiosClientError(FAILURE_BLOB_UNSUPPORTED);
    }

    let response: HttpResponseModel<ResponseModel>;
    try {
      response = await this.client.request(resultConfig);
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

    // A write may answer with the stored content, which runs into the same wall a read would: checked
    // here rather than up front, because the usual answer is 204 and that case is perfectly fine.
    if (internalConfig.dataType === ODataHttpDataTypes.BLOB && !hasBinaryCapableAdapter() && !isEmpty(response.data)) {
      throw new AxiosClientError(FAILURE_BLOB_UNSUPPORTED, response.status, response.headers);
    }

    return response;
  }

  protected mapHeaders(headers: AxiosResponseHeaders | RawAxiosResponseHeaders): Record<string, string> {
    return headers as Record<string, string>;
  }
}
