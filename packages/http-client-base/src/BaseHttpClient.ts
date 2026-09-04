import {
  BatchClientOptions,
  BatchRequestBody,
  BatchResponseBody,
  ConcurrencyHandler,
  HttpResponseModel,
  ODataClientError,
  ODataHttpClientOptions,
  ODataHttpDataTypes,
  ODataHttpMethods,
  ODataRequestConfig,
  ODataResponse,
  ResourceIdentityHandler,
} from "@odata2ts/http-client-api";
import {
  CsrfTokenHandler,
  ErrorMessageRetriever,
  getDefaultJsonHeaders,
  getJsonHeaders,
  InMemoryConcurrencyHandler,
  InMemoryResourceIdentityHandler,
  isPlainTextBody,
  JSON_MIME_TYPE,
  mergeHeaders,
  parseBatchResponse,
  retrieveErrorMessage,
  serializeBatchRequest,
} from "@odata2ts/http-client-common";

export interface BaseRequestConfig extends ODataRequestConfig {
  dataType?: ODataHttpDataTypes;
  /**
   * Very special option needed for FetchClient to not evaluate the response body in certain situations.
   */
  noBodyEvaluation?: boolean;
}

const FAILURE_MISSING_URL = "Value for URL must be provided!";

function toInternalConfig(headers: Record<string, string>, additionalHeaders?: Record<string, string>) {
  return {
    headers: mergeHeaders(headers, additionalHeaders),
    dataType: ODataHttpDataTypes.JSON,
  };
}

function getAdditionalHeaders(jsonResponse: boolean, additionalHeaders?: Record<string, string>, contentType?: string) {
  let headers: Record<string, string> = {};
  if (jsonResponse) {
    headers.Accept = JSON_MIME_TYPE;
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
  /**
   * The ETags this client has seen - see {@link ConcurrencyHandler}. Always present, so that
   * `@odata2ts/odata-service` never has to ask whether this client can do concurrency control.
   */
  public readonly concurrency: ConcurrencyHandler;

  /**
   * The route↔canonical-resource mappings this client has observed - see {@link ResourceIdentityHandler}.
   * Always present, for the same reason {@link concurrency} is: `@odata2ts/odata-service` never has to ask
   * whether this client can do it.
   */
  public readonly resourceIdentity: ResourceIdentityHandler;

  protected readonly csrf: CsrfTokenHandler;

  protected retrieveErrorMessage: ErrorMessageRetriever = retrieveErrorMessage;

  protected constructor(baseOptions: ODataHttpClientOptions = { useCsrfProtection: false }) {
    this.csrf = new CsrfTokenHandler(baseOptions);
    this.concurrency =
      baseOptions.concurrencyHandler ??
      new InMemoryConcurrencyHandler({ blindConcurrencyWrites: baseOptions.blindConcurrencyWrites });
    this.resourceIdentity = baseOptions.resourceIdentityHandler ?? new InMemoryResourceIdentityHandler();
  }

  /**
   * Whether the given headers declare the request body as plain text, in which case it must be passed
   * to the server as it is: serializing it as JSON would wrap it into double quotes.
   *
   * @param headers the headers of the request
   */
  protected isPlainTextBody(headers?: Record<string, string>): boolean {
    return isPlainTextBody(headers);
  }

  /**
   * Main function to implement by any extending http client.
   * As it name suggests, the request gets executed in this method.
   * Additionally, failures should be handled and errors of type `HttpClientError` should be thrown.
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
    return this.csrf.getKey();
  }

  public setCsrfTokenKey(newKey: string) {
    this.csrf.setKey(newKey);
  }

  public setErrorMessageRetriever(getErrorMsg: ErrorMessageRetriever) {
    this.retrieveErrorMessage = getErrorMsg;
  }

  protected async setupSecurityToken(): Promise<[string, string | undefined]> {
    return [this.csrf.getKey(), await this.csrf.getToken(() => this.fetchSecurityToken())];
  }

  protected async fetchSecurityToken(): Promise<string | undefined> {
    const tokenKey = this.csrf.getKey();
    const response = await this.sendRequest(ODataHttpMethods.Get, this.csrf.getFetchUrl(), undefined, undefined, {
      noBodyEvaluation: true,
      headers: { [tokenKey]: "Fetch", Accept: JSON_MIME_TYPE },
    });

    return response.headers[tokenKey];
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
    if (this.csrf.appliesTo(method)) {
      const [tokenKey, tokenValue] = await this.setupSecurityToken();
      if (tokenValue) {
        internalConfig.headers = { ...internalConfig.headers, [tokenKey]: tokenValue };
      }
    }

    try {
      return await this.executeRequest<ResponseModel>(method, url, data, requestConfig, internalConfig);
    } catch (e) {
      // automatic CSRF token handling: only ever repeat a request once, since a server which keeps
      // demanding a new token would otherwise make us recurse endlessly
      if (!isRetry && this.csrf.isExpired(e as ODataClientError, method)) {
        // token has expired: reset csrf token & perform the original request again;
        // the internal config must be handed over as well, otherwise the repeated request would lose
        // its headers (content type!) and its data type
        this.csrf.reset();
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
      toInternalConfig(getJsonHeaders(false), additionalHeaders),
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
      toInternalConfig(getJsonHeaders(true), additionalHeaders),
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
      toInternalConfig(getJsonHeaders(true), additionalHeaders),
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
      toInternalConfig(getJsonHeaders(true), additionalHeaders),
    );
  }

  public delete(
    url: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<undefined>> {
    return this.sendRequest<undefined>(
      ODataHttpMethods.Delete,
      url,
      undefined,
      requestConfig,
      toInternalConfig(getJsonHeaders(false), additionalHeaders),
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
      // unlike the dedicated methods above the method is only known here, so the content type follows it:
      // a GET or DELETE routed through this entry point carries no body and therefore declares none
      toInternalConfig(getDefaultJsonHeaders(method), additionalHeaders),
    );
  }

  public async batch(
    url: string,
    body: BatchRequestBody,
    options?: BatchClientOptions,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<BatchResponseBody>> {
    const format = options?.format ?? "multipart";
    const { contentType, accept, payload } = serializeBatchRequest(body, { format });
    const headers = mergeHeaders(
      { Accept: accept, "Content-Type": contentType },
      options?.continueOnError ? { Prefer: "odata.continue-on-error" } : undefined,
      additionalHeaders,
    );

    const response = await this.sendRequest<string>(ODataHttpMethods.Post, url, payload, requestConfig, {
      headers,
      dataType: ODataHttpDataTypes.TEXT,
    });

    return {
      ...response,
      data: parseBatchResponse(response.data, body, { format, contentType: response.headers["content-type"] }),
    };
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
