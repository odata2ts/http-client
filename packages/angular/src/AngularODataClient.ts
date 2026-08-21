import { Inject, Injectable, InjectionToken, Optional } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { firstValueFrom, Observable } from "rxjs";

import {
  ConcurrencyHandler,
  HttpResponseModel,
  ODataHttpClient,
  ODataHttpClientOptions,
  ODataHttpMethods,
  ODataRequestConfig,
  ODataResponse,
} from "@odata2ts/http-client-api";
import {
  buildErrorMessage,
  CsrfTokenHandler,
  DEFAULT_ERROR_MESSAGE,
  ErrorMessageRetriever,
  FAILURE_NO_RESPONSE,
  FAILURE_RESPONSE_MESSAGE,
  getDefaultJsonHeaders,
  InMemoryConcurrencyHandler,
  JSON_MIME_TYPE,
  mergeHeaders,
  retrieveErrorMessage,
} from "@odata2ts/http-client-common";
import { AngularODataRequestConfig } from "./AngularODataRequestConfig";
import { AngularODataError } from "./AngularODataError";

export { DEFAULT_CSRF_TOKEN_KEY, DEFAULT_ERROR_MESSAGE } from "@odata2ts/http-client-common";

/**
 * DI token for {@link ODataHttpClientOptions}, e.g. to activate automatic CSRF token handling.
 *
 * `AngularODataClient` is provided in root and constructed by Angular's own DI container, so its options
 * cannot be passed as a plain constructor argument the way the other odata2ts HTTP clients accept them -
 * there is no `new AngularODataClient(options)` call for Angular to intercept. Providing this token is how a
 * consuming application supplies them instead:
 *
 * ```ts
 * providers: [
 *   { provide: ANGULAR_ODATA_CLIENT_OPTIONS, useValue: { useCsrfProtection: true, csrfTokenFetchUrl: "/odata/service/" } },
 * ]
 * ```
 */
export const ANGULAR_ODATA_CLIENT_OPTIONS = new InjectionToken<ODataHttpClientOptions>("ANGULAR_ODATA_CLIENT_OPTIONS");

@Injectable({
  providedIn: "root",
})
export class AngularODataClient implements ODataHttpClient<AngularODataRequestConfig> {
  protected retrieveErrorMessage: ErrorMessageRetriever = retrieveErrorMessage;

  /**
   * The ETags this client has seen - see {@link ConcurrencyHandler}. Always present, so that
   * `@odata2ts/odata-service` never has to ask whether this client can do concurrency control.
   */
  public readonly concurrency: ConcurrencyHandler;

  private readonly csrf: CsrfTokenHandler;

  constructor(
    private readonly http: HttpClient,
    @Optional() @Inject(ANGULAR_ODATA_CLIENT_OPTIONS) options?: ODataHttpClientOptions | null,
  ) {
    const resolved = options ?? { useCsrfProtection: false };
    this.csrf = new CsrfTokenHandler(resolved);
    this.concurrency =
      resolved.concurrencyHandler ??
      new InMemoryConcurrencyHandler({ blindConcurrencyWrites: resolved.blindConcurrencyWrites });
  }

  /**
   * Overrides how the OData error message is picked out of a failed response's body.
   *
   * @param getErrorMsg
   */
  public setErrorMessageRetriever(getErrorMsg: ErrorMessageRetriever) {
    this.retrieveErrorMessage = getErrorMsg;
  }

  public getCsrfTokenKey() {
    return this.csrf.getKey();
  }

  public setCsrfTokenKey(newKey: string) {
    this.csrf.setKey(newKey);
  }

  get<ResponseModel>(
    url: string,
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.request(url, ODataHttpMethods.Get, undefined, requestConfig, additionalHeaders);
  }

  post<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.request(url, ODataHttpMethods.Post, data, requestConfig, additionalHeaders);
  }

  put<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.request(url, ODataHttpMethods.Put, data, requestConfig, additionalHeaders);
  }

  patch<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.request(url, ODataHttpMethods.Patch, data, requestConfig, additionalHeaders);
  }

  delete(
    url: string,
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<undefined>> {
    return this.request(url, ODataHttpMethods.Delete, undefined, requestConfig, additionalHeaders);
  }

  request<ResponseModel>(
    url: string,
    method: ODataHttpMethods,
    data: any,
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(
      method,
      requestConfig,
      additionalHeaders,
      getDefaultJsonHeaders(method),
      (headers) =>
        this.http.request(method, url, {
          body: data,
          observe: "response",
          responseType: "json",
          headers,
          params: this.buildParams(requestConfig),
        }) as Observable<HttpResponse<ResponseModel>>,
    );
  }

  getBlob(
    url: string,
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<Blob> {
    return this.execute<Blob>(
      this.http.get(url, {
        observe: "response",
        responseType: "blob",
        headers: this.buildHeaders(requestConfig, additionalHeaders),
        params: this.buildParams(requestConfig),
      }) as Observable<HttpResponse<Blob>>,
    );
  }

  createBlob(
    url: string,
    data: Blob,
    mimeType: string,
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | Blob> {
    return this.uploadBlob(ODataHttpMethods.Post, url, data, mimeType, requestConfig, additionalHeaders);
  }

  updateBlob(
    url: string,
    data: Blob,
    mimeType: string,
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | Blob> {
    return this.uploadBlob(ODataHttpMethods.Put, url, data, mimeType, requestConfig, additionalHeaders);
  }

  async getStream(): ODataResponse<ReadableStream> {
    throw new Error(
      "AngularODataClient does not support ReadableStream responses, regardless of the configured HttpClient " +
        "backend (XhrBackend or FetchBackend via withFetch()) - use the Fetch Client (@odata2ts/http-client-fetch) " +
        "for streams.",
    );
  }

  async createStream(): ODataResponse<void | ReadableStream> {
    throw new Error(
      "AngularODataClient does not support ReadableStream uploads, regardless of the configured HttpClient " +
        "backend (XhrBackend or FetchBackend via withFetch()) - use the Fetch Client (@odata2ts/http-client-fetch) " +
        "for streams.",
    );
  }

  async updateStream(): ODataResponse<void | ReadableStream> {
    throw new Error(
      "AngularODataClient does not support ReadableStream uploads, regardless of the configured HttpClient " +
        "backend (XhrBackend or FetchBackend via withFetch()) - use the Fetch Client (@odata2ts/http-client-fetch) " +
        "for streams.",
    );
  }

  private uploadBlob(
    method: ODataHttpMethods.Post | ODataHttpMethods.Put,
    url: string,
    blob: Blob,
    mimeType: string,
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | Blob> {
    return this.sendRequest<void | Blob>(
      method,
      requestConfig,
      additionalHeaders,
      { Accept: JSON_MIME_TYPE },
      (headers) =>
        this.http.request(method, url, {
          body: blob,
          observe: "response",
          responseType: "blob",
          headers: headers.set("Content-Type", mimeType),
          params: this.buildParams(requestConfig),
        }) as Observable<HttpResponse<void | Blob>>,
    );
  }

  /**
   * Builds the request headers (JSON defaults + caller overrides + CSRF token, if applicable), runs the
   * request, and - if automatic CSRF protection is enabled and the server signals an expired token (403
   * with the configured header set to `"Required"`) - clears the cached token and retries exactly once.
   * Only ever repeats a request once, since a server which keeps demanding a new token would otherwise
   * make this recurse endlessly.
   */
  private async sendRequest<T>(
    method: ODataHttpMethods,
    requestConfig: ODataRequestConfig | undefined,
    additionalHeaders: Record<string, string> | undefined,
    defaultHeaders: Record<string, string> | undefined,
    buildRequest: (headers: HttpHeaders) => Observable<HttpResponse<T>>,
    isRetry: boolean = false,
  ): Promise<HttpResponseModel<T>> {
    let headers = this.buildHeaders(requestConfig, additionalHeaders, defaultHeaders);

    if (this.csrf.appliesTo(method)) {
      const token = await this.csrf.getToken(() => this.fetchCsrfToken());
      if (token) {
        headers = headers.set(this.csrf.getKey(), token);
      }
    }

    try {
      return await this.execute<T>(buildRequest(headers));
    } catch (e) {
      if (!isRetry && this.csrf.isExpired(e as AngularODataError, method)) {
        this.csrf.reset();
        return this.sendRequest<T>(method, requestConfig, additionalHeaders, defaultHeaders, buildRequest, true);
      }

      throw e;
    }
  }

  private async fetchCsrfToken(): Promise<string | undefined> {
    const tokenKey = this.csrf.getKey();
    const fetchUrl = this.csrf.getFetchUrl();
    const headers = new HttpHeaders({ [tokenKey]: "Fetch", Accept: JSON_MIME_TYPE });

    // read as text rather than json: this request only cares about the response header carrying the
    // token, and forcing json parsing on whatever body the fetch URL happens to return could fail the
    // token fetch over an unrelated body-parsing error
    const response = await this.execute<string>(
      this.http.request(ODataHttpMethods.Get, fetchUrl, {
        observe: "response",
        responseType: "text",
        headers,
      }) as Observable<HttpResponse<string>>,
    );

    return response.headers[tokenKey.toLowerCase()];
  }

  /**
   * Runs the request and normalizes both outcomes: a successful response is mapped to a
   * {@link HttpResponseModel}, a failing one is wrapped in an {@link AngularODataError} so every entry point
   * (including the blob operations) reports failures the same way.
   */
  private async execute<T>(source: Observable<HttpResponse<T>>): Promise<HttpResponseModel<T>> {
    try {
      const response = await firstValueFrom(source);
      return this.mapResponse<T>(response);
    } catch (e) {
      const error = e as HttpErrorResponse;

      // status 0 means the request never reached a server (network failure, CORS, ...) - there is no
      // OData error document in the body to parse in that case
      if (typeof error.status === "number" && error.status > 0) {
        const errMsg = this.retrieveErrorMessage(error.error);
        throw new AngularODataError(
          buildErrorMessage(FAILURE_RESPONSE_MESSAGE, errMsg),
          error.status,
          this.mapHeaders(error.headers),
          new Error(errMsg || DEFAULT_ERROR_MESSAGE),
          error,
        );
      }

      throw new AngularODataError(buildErrorMessage(FAILURE_NO_RESPONSE, error), error.status, undefined, error, error);
    }
  }

  /**
   * Turns the merged headers - see {@link mergeHeaders} for the precedence - into Angular's own
   * `HttpHeaders`.
   */
  private buildHeaders(
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
    defaultHeaders?: Record<string, string>,
  ): HttpHeaders {
    let headers = new HttpHeaders();

    for (const [key, value] of Object.entries(
      mergeHeaders(defaultHeaders, additionalHeaders, requestConfig?.headers),
    )) {
      headers = headers.set(key, value);
    }

    return headers;
  }

  private buildParams(requestConfig?: ODataRequestConfig): HttpParams {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(requestConfig?.params ?? {})) {
      if (Array.isArray(value)) {
        for (const item of value) {
          params = params.append(key, String(item));
        }
      } else {
        params = params.set(key, String(value));
      }
    }

    return params;
  }

  private mapResponse<T>(response: HttpResponse<T>): HttpResponseModel<T> {
    return {
      status: response.status,
      statusText: response.statusText,
      headers: this.mapHeaders(response.headers),
      data: response.body as T,
    };
  }

  /**
   * Header names are lower-cased on the way out, since `HttpHeaders.keys()` preserves whatever casing the
   * server originally used (unlike axios/fetch, which normalize to lowercase themselves) - without this,
   * looking up a header by a known, fixed-case name (e.g. the CSRF token key) would be unreliable.
   */
  private mapHeaders(headers: HttpHeaders): Record<string, string> {
    return headers.keys().reduce<Record<string, string>>((collector, key) => {
      const value = headers.get(key);
      if (value !== null) {
        collector[key.toLowerCase()] = value;
      }
      return collector;
    }, {});
  }
}
