import {
  HttpResponseModel,
  ODataHttpClient,
  ODataHttpClientOptions,
  ODataHttpDataTypes,
  ODataHttpMethods,
} from "@odata2ts/http-client-api";
import { BaseHttpClient, BaseRequestConfig, parseErrorResponseBody } from "@odata2ts/http-client-base";
import { buildErrorMessage, DEFAULT_ERROR_MESSAGE, FAILURE_RESPONSE_MESSAGE } from "@odata2ts/http-client-common";
import { FetchClientError } from "./FetchClientError";
import { FetchRequestConfig, getDefaultConfig, mergeFetchConfig } from "./FetchRequestConfig";

export { DEFAULT_ERROR_MESSAGE } from "@odata2ts/http-client-common";

const FETCH_FAILURE_MESSAGE = "OData request failed entirely: ";
const JSON_RETRIEVAL_FAILURE_MESSAGE = "Retrieving JSON body from OData response failed: ";
const BLOB_RETRIEVAL_FAILURE_MESSAGE = "Retrieving blob from OData response failed: ";

/**
 * Whether the body is a stream, in which case fetch needs to be told about it explicitly.
 *
 * Guarded by a typeof check, since a runtime without ReadableStream cannot have produced one either.
 */
function isReadableStream(body: unknown): body is ReadableStream {
  return typeof ReadableStream !== "undefined" && body instanceof ReadableStream;
}

interface InternalFetchConfig extends FetchRequestConfig, Pick<RequestInit, "method" | "body"> {
  /**
   * Required by the Fetch standard as soon as the request body is a stream - without it fetch refuses
   * the request altogether. Declared here since RequestInit does not carry it yet.
   */
  duplex?: "half";
}

export class FetchClient extends BaseHttpClient<FetchRequestConfig> implements ODataHttpClient<FetchRequestConfig> {
  protected readonly config: FetchRequestConfig;

  constructor(config?: FetchRequestConfig, clientOptions?: ODataHttpClientOptions) {
    super(clientOptions);
    this.config = getDefaultConfig(config);
  }

  protected async executeRequest<ResponseModel>(
    method: ODataHttpMethods,
    url: string,
    data: any,
    requestConfig: FetchRequestConfig | undefined = {},
    internalConfig: BaseRequestConfig,
  ): Promise<HttpResponseModel<ResponseModel>> {
    const { headers, noBodyEvaluation } = internalConfig;
    const { params, ...config } = mergeFetchConfig(this.config, { headers }, requestConfig);

    // set core inputs for request
    const resultConfig: InternalFetchConfig = {
      ...config,
      method,
    };
    if (typeof data !== "undefined") {
      const serializeAsJson =
        internalConfig.dataType === ODataHttpDataTypes.JSON && !this.isPlainTextBody(internalConfig.headers);
      resultConfig.body = serializeAsJson ? JSON.stringify(data) : data;

      if (isReadableStream(resultConfig.body)) {
        resultConfig.duplex = "half";
      }
    }

    // apply additional query params to the URL
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
      response = await fetch(finalUrl, resultConfig);
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
        responseData = await this.getErrorResponseBody(response);
      } catch (e) {
        responseData = undefined;
      }
      const errMsg = this.retrieveErrorMessage(responseData);

      throw new FetchClientError(
        buildErrorMessage(FAILURE_RESPONSE_MESSAGE, errMsg),
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
      // only json and blob can fail here at all: reading the stream is up to the caller, and a
      // response without a body never reaches this point
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

  protected async getResponseBody(response: Response, options: BaseRequestConfig) {
    if (response.status === 204) {
      return undefined;
    }
    switch (options.dataType) {
      case "blob":
        return response.blob();
      case "text":
        return response.text();
      case "stream":
        // a response without any body at all yields null here, which the declared ReadableStream does
        // not include; undefined is what a 204 already hands back for every other data type
        return response.body ?? undefined;
      // json is the default data type throughout, so anything else is read as json as well
      default:
        return response.json();
    }
  }

  /**
   * The body of a failed response, read independently of what the request asked for.
   *
   * `getResponseBody` would apply the request's data type, which describes the successful payload: a
   * `getBlob` would read the server's error document as binary and a `getStream` would hand the unread
   * stream on, so the message inside it never reaches the caller. Text is what every error document has
   * in common, whether it turns out to be JSON or not.
   */
  protected async getErrorResponseBody(response: Response) {
    if (response.status === 204) {
      return undefined;
    }

    return parseErrorResponseBody(await response.text());
  }

  protected mapHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => (result[key] = value));

    return result;
  }
}
