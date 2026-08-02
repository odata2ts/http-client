import {
  DATA_MANIPULATION_METHODS,
  HttpResponseModel,
  ODataClientError,
  ODataHttpClientOptions,
  ODataHttpMethods,
  ODataRequestConfig,
  ODataResponse,
} from "@odata2ts/http-client-api";
import { ODataHttpDataTypes } from "@odata2ts/http-client-api/lib/ODataHttpDataTypes";
import { ErrorMessageRetriever, retrieveErrorMessage } from "./ErrorMessageRetriever";

export interface BaseRequestConfig extends ODataRequestConfig {
  dataType?: ODataHttpDataTypes;
  /**
   * Very special option needed for FetchClient to not evaluate the response body in certain situations.
   */
  noBodyEvaluation?: boolean;
}

export const DEFAULT_CSRF_TOKEN_KEY = "x-csrf-token";
const FAILURE_MISSING_CSRF_URL =
  "When automatic CSRF token handling is activated, the URL must be supplied via attribute [csrfTokenFetchUrl]!";
const FAILURE_MISSING_URL = "Value for URL must be provided!";
const JSON_VALUE = "application/json";
const PLAIN_TEXT_VALUE = "text/plain";
const CONTENT_TYPE_KEY = "content-type";

function getInternalConfigWithJsonHeaders(
  headers?: Record<string, string>,
  setContentType: boolean = true,
): BaseRequestConfig {
  return {
    headers: {
      Accept: JSON_VALUE,
      ...(setContentType ? { "Content-Type": JSON_VALUE } : undefined),
      ...headers,
    },
    dataType: ODataHttpDataTypes.JSON,
  };
}

function getAdditionalHeaders(jsonResponse: boolean, additionalHeaders?: Record<string, string>, contentType?: string) {
  let headers: Record<string, string> = {};
  if (jsonResponse) {
    headers.Accept = JSON_VALUE;
  }
  if (additionalHeaders) {
    headers = { ...headers, ...additionalHeaders };
  }
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return Object.keys(headers).length ? { headers } : undefined;
}

export abstract class BaseHttpClient<RequestConfigType> {
  private csrfToken: string | undefined;
  private csrfTokenKey = DEFAULT_CSRF_TOKEN_KEY;

  protected retrieveErrorMessage: ErrorMessageRetriever = retrieveErrorMessage;

  protected constructor(private baseOptions: ODataHttpClientOptions = { useCsrfProtection: false }) {
    if (baseOptions.useCsrfProtection && !baseOptions.csrfTokenFetchUrl?.trim()) {
      throw new Error(FAILURE_MISSING_CSRF_URL);
    }
  }

  /**
   * Whether the given headers declare the request body as plain text, in which case it must be passed
   * to the server as it is: serializing it as JSON would wrap it into double quotes.
   *
   * The header name is matched case-insensitively, since callers are free to choose their own spelling.
   * Of multiple matches the last one wins, mirroring how the headers were merged in the first place.
   *
   * @param headers the headers of the request
   */
  protected isPlainTextBody(headers?: Record<string, string>): boolean {
    const contentType = Object.entries(headers ?? {})
      .filter(([key]) => key.toLowerCase() === CONTENT_TYPE_KEY)
      .pop()?.[1];

    return !!contentType?.toLowerCase().startsWith(PLAIN_TEXT_VALUE);
  }

  /**
   * Main function to implement by any extending http client.
   * As it name suggests, the request gets executed in this method.
   * Additionally, failures should be handled and errors of type <code>HttpClientError</code> should be thrown.
   *
   * @param method the http method to use
   * @param url the URL to use
   * @param data data for the request body if any
   * @param config request configuration from end user which should override default settings
   * @param internalConfig request configuration from base client including additional headers which should override end user configurations;
   *        always handed over, so implementations do not need a fallback for it
   */
  protected abstract executeRequest<ResponseModel>(
    method: ODataHttpMethods,
    url: string,
    data: any,
    config: RequestConfigType | undefined,
    internalConfig: BaseRequestConfig,
  ): Promise<HttpResponseModel<ResponseModel>>;

  public getCsrfTokenKey() {
    return this.csrfTokenKey;
  }

  public setCsrfTokenKey(newKey: string) {
    this.csrfTokenKey = newKey || DEFAULT_CSRF_TOKEN_KEY;
  }

  public setErrorMessageRetriever(getErrorMsg: ErrorMessageRetriever) {
    this.retrieveErrorMessage = getErrorMsg;
  }

  protected async setupSecurityToken(): Promise<[string, string | undefined]> {
    if (!this.csrfToken) {
      this.csrfToken = await this.fetchSecurityToken();
    }
    return [this.csrfTokenKey, this.csrfToken];
  }

  protected async fetchSecurityToken(): Promise<string | undefined> {
    const fetchUrl = this.baseOptions!.csrfTokenFetchUrl!;
    const response = await this.sendRequest(ODataHttpMethods.Get, fetchUrl, undefined, undefined, {
      noBodyEvaluation: true,
      headers: { [this.csrfTokenKey]: "Fetch", Accept: JSON_VALUE },
    });

    return response.headers[this.csrfTokenKey];
  }

  /**
   * Follows the template pattern.
   *
   * @param method
   * @param url
   * @param data
   * @param requestConfig
   * @param internalConfig
   * @param isRetry whether this is already the repetition of a request whose CSRF token had expired
   * @private
   */
  private async sendRequest<ResponseModel>(
    method: ODataHttpMethods,
    url: string,
    data: any,
    requestConfig: RequestConfigType | undefined,
    internalConfig: BaseRequestConfig,
    isRetry: boolean = false,
  ): Promise<HttpResponseModel<ResponseModel>> {
    // noinspection SuspiciousTypeOfGuard
    if (typeof url !== "string") {
      throw new Error(FAILURE_MISSING_URL);
    }

    // setup automatic CSRF token handling
    if (this.baseOptions.useCsrfProtection && DATA_MANIPULATION_METHODS.includes(method)) {
      const [tokenKey, tokenValue] = await this.setupSecurityToken();
      if (tokenValue) {
        internalConfig.headers = { ...internalConfig.headers, [tokenKey]: tokenValue };
      }
    }

    try {
      return await this.executeRequest<ResponseModel>(method, url, data, requestConfig, internalConfig);
    } catch (e) {
      const clientError = e as ODataClientError;

      // automatic CSRF token handling: only ever repeat a request once, since a server which keeps
      // demanding a new token would otherwise make us recurse endlessly
      if (
        !isRetry &&
        !!this.baseOptions.useCsrfProtection &&
        clientError.status === 403 &&
        !!clientError.headers &&
        clientError.headers[this.csrfTokenKey] === "Required"
      ) {
        // token has expired: reset csrf token & perform the original request again;
        // the internal config must be handed over as well, otherwise the repeated request would lose
        // its headers (content type!) and its data type
        this.csrfToken = undefined;
        return this.sendRequest<ResponseModel>(method, url, data, requestConfig, internalConfig, true);
      }

      throw e;
    }
  }

  public get<ResponseModel>(
    url: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(
      ODataHttpMethods.Get,
      url,
      undefined,
      requestConfig,
      getInternalConfigWithJsonHeaders(additionalHeaders, false),
    );
  }

  public post<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(
      ODataHttpMethods.Post,
      url,
      data,
      requestConfig,
      getInternalConfigWithJsonHeaders(additionalHeaders),
    );
  }

  public put<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(
      ODataHttpMethods.Put,
      url,
      data,
      requestConfig,
      getInternalConfigWithJsonHeaders(additionalHeaders),
    );
  }

  public patch<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(
      ODataHttpMethods.Patch,
      url,
      data,
      requestConfig,
      getInternalConfigWithJsonHeaders(additionalHeaders),
    );
  }

  public delete(
    url: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<void>> {
    return this.sendRequest<void>(
      ODataHttpMethods.Delete,
      url,
      undefined,
      requestConfig,
      getInternalConfigWithJsonHeaders(additionalHeaders, false),
    );
  }

  public request<ResponseModel>(
    url: string,
    method: ODataHttpMethods,
    data: any,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(
      method,
      url,
      data,
      requestConfig,
      getInternalConfigWithJsonHeaders(additionalHeaders),
    );
  }

  public getBlob(
    url: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<Blob> {
    return this.sendRequest(ODataHttpMethods.Get, url, undefined, requestConfig, {
      ...getAdditionalHeaders(false, additionalHeaders),
      dataType: ODataHttpDataTypes.BLOB,
    });
  }

  public getStream(
    url: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<ReadableStream> {
    return this.sendRequest(ODataHttpMethods.Get, url, undefined, requestConfig, {
      ...getAdditionalHeaders(false, additionalHeaders),
      dataType: ODataHttpDataTypes.STREAM,
    });
  }

  public createBlob(
    url: string,
    data: Blob,
    mimeType: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | Blob> {
    return this.sendRequest(ODataHttpMethods.Post, url, data, requestConfig, {
      ...getAdditionalHeaders(true, additionalHeaders, mimeType),
      dataType: ODataHttpDataTypes.BLOB,
    });
  }

  public updateBlob(
    url: string,
    data: Blob,
    mimeType: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | Blob> {
    return this.sendRequest(ODataHttpMethods.Put, url, data, requestConfig, {
      ...getAdditionalHeaders(true, additionalHeaders, mimeType),
      dataType: ODataHttpDataTypes.BLOB,
    });
  }

  public createStream(
    url: string,
    data: ReadableStream,
    mimeType: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | ReadableStream> {
    return this.sendRequest(ODataHttpMethods.Post, url, data, requestConfig, {
      ...getAdditionalHeaders(true, additionalHeaders, mimeType),
      dataType: ODataHttpDataTypes.STREAM,
    });
  }

  public updateStream(
    url: string,
    data: ReadableStream,
    mimeType: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | ReadableStream> {
    return this.sendRequest(ODataHttpMethods.Put, url, data, requestConfig, {
      ...getAdditionalHeaders(true, additionalHeaders, mimeType),
      dataType: ODataHttpDataTypes.STREAM,
    });
  }
}
