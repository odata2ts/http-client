import { Inject, Injectable, InjectionToken, Optional } from "@angular/core";
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { firstValueFrom, Observable } from "rxjs";

import {
  DATA_MANIPULATION_METHODS,
  HttpResponseModel,
  ODataHttpClient,
  ODataHttpClientOptions,
  ODataHttpMethods,
  ODataRequestConfig,
  ODataResponse,
} from "@odata2ts/http-client-api";
import { ErrorMessageRetriever, retrieveErrorMessage } from "./ErrorMessageRetriever";
import { AngularXhrRequestConfig } from "./AngularXhrRequestConfig";
import { AngularXhrError } from "./AngularClientError";

export const DEFAULT_ERROR_MESSAGE = "No error message!";
export const DEFAULT_CSRF_TOKEN_KEY = "x-csrf-token";
const FAILURE_RESPONSE_MESSAGE = "OData server responded with error: ";
const FAILURE_NO_RESPONSE = "No response from server! Failure: ";
const FAILURE_MISSING_CSRF_URL =
  "When automatic CSRF token handling is activated, the URL must be supplied via attribute [csrfTokenFetchUrl]!";
const JSON_VALUE = "application/json";
const BODYLESS_METHODS: ReadonlyArray<ODataHttpMethods> = [ODataHttpMethods.Get, ODataHttpMethods.Delete];

/**
 * DI token for {@link ODataHttpClientOptions}, e.g. to activate automatic CSRF token handling.
 *
 * `AngularXhrClient` is provided in root and constructed by Angular's own DI container, so its options
 * cannot be passed as a plain constructor argument the way the other odata2ts HTTP clients accept them -
 * there is no `new AngularXhrClient(options)` call for Angular to intercept. Providing this token is how a
 * consuming application supplies them instead:
 *
 * ```ts
 * providers: [
 *   { provide: ANGULAR_XHR_CLIENT_OPTIONS, useValue: { useCsrfProtection: true, csrfTokenFetchUrl: "/odata/service/" } },
 * ]
 * ```
 */
export const ANGULAR_XHR_CLIENT_OPTIONS = new InjectionToken<ODataHttpClientOptions>("ANGULAR_XHR_CLIENT_OPTIONS");

function buildErrorMessage(prefix: string, error: any) {
  const msg = typeof error === "string" ? error : (error as Error)?.message;
  return prefix + (msg || DEFAULT_ERROR_MESSAGE);
}

/**
 * Default headers for a JSON request: every method gets `Accept`, methods that carry a body also get
 * `Content-Type`s.
 */
function getDefaultHeaders(method: ODataHttpMethods): Record<string, string> {
  return BODYLESS_METHODS.includes(method)
    ? { Accept: JSON_VALUE }
    : { Accept: JSON_VALUE, "Content-Type": JSON_VALUE };
}

@Injectable({
  providedIn: "root",
})
export class AngularXhrClient implements ODataHttpClient<AngularXhrRequestConfig> {
  protected retrieveErrorMessage: ErrorMessageRetriever = retrieveErrorMessage;

  private readonly options: ODataHttpClientOptions;
  private csrfToken: string | undefined;
  private csrfTokenKey = DEFAULT_CSRF_TOKEN_KEY;

  constructor(
    private readonly http: HttpClient,
    @Optional() @Inject(ANGULAR_XHR_CLIENT_OPTIONS) options?: ODataHttpClientOptions | null,
  ) {
    this.options = options ?? { useCsrfProtection: false };
    if (this.options.useCsrfProtection && !this.options.csrfTokenFetchUrl?.trim()) {
      throw new Error(FAILURE_MISSING_CSRF_URL);
    }
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
    return this.csrfTokenKey;
  }

  public setCsrfTokenKey(newKey: string) {
    this.csrfTokenKey = newKey || DEFAULT_CSRF_TOKEN_KEY;
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
      getDefaultHeaders(method),
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
    throw new Error("AngularXhrClient is based on XMLHttpRequest and does not support ReadableStream responses.");
  }

  async createStream(): ODataResponse<void | ReadableStream> {
    throw new Error("AngularXhrClient is based on XMLHttpRequest and does not support ReadableStream uploads.");
  }

  async updateStream(): ODataResponse<void | ReadableStream> {
    throw new Error("AngularXhrClient is based on XMLHttpRequest and does not support ReadableStream uploads.");
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
      { Accept: JSON_VALUE },
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

    if (this.options.useCsrfProtection && DATA_MANIPULATION_METHODS.includes(method)) {
      const token = await this.getCsrfToken();
      if (token) {
        headers = headers.set(this.csrfTokenKey, token);
      }
    }

    try {
      return await this.execute<T>(buildRequest(headers));
    } catch (e) {
      const error = e as AngularXhrError;

      if (
        !isRetry &&
        this.options.useCsrfProtection &&
        DATA_MANIPULATION_METHODS.includes(method) &&
        error.status === 403 &&
        error.headers?.[this.csrfTokenKey.toLowerCase()] === "Required"
      ) {
        this.csrfToken = undefined;
        return this.sendRequest<T>(method, requestConfig, additionalHeaders, defaultHeaders, buildRequest, true);
      }

      throw e;
    }
  }

  private async getCsrfToken(): Promise<string | undefined> {
    if (!this.csrfToken) {
      this.csrfToken = await this.fetchCsrfToken();
    }
    return this.csrfToken;
  }

  private async fetchCsrfToken(): Promise<string | undefined> {
    const fetchUrl = this.options.csrfTokenFetchUrl!;
    const headers = new HttpHeaders({ [this.csrfTokenKey]: "Fetch", Accept: JSON_VALUE });

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

    return response.headers[this.csrfTokenKey.toLowerCase()];
  }

  /**
   * Runs the request and normalizes both outcomes: a successful response is mapped to a
   * {@link HttpResponseModel}, a failing one is wrapped in an {@link AngularXhrError} so every entry point
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
        throw new AngularXhrError(
          buildErrorMessage(FAILURE_RESPONSE_MESSAGE, errMsg),
          error.status,
          this.mapHeaders(error.headers),
          new Error(errMsg || DEFAULT_ERROR_MESSAGE),
          error,
        );
      }

      throw new AngularXhrError(buildErrorMessage(FAILURE_NO_RESPONSE, error), error.status, undefined, error, error);
    }
  }

  /**
   * Merges headers with increasing precedence: the JSON defaults are the fallback, `additionalHeaders`
   * (passed by callers alongside the request) can override them, and `requestConfig.headers` (passed
   * alongside the request's own configuration) wins over both - matching the precedence used by the other
   * odata2ts HTTP clients.
   */
  private buildHeaders(
    requestConfig?: ODataRequestConfig,
    additionalHeaders?: Record<string, string>,
    defaultHeaders?: Record<string, string>,
  ): HttpHeaders {
    let headers = new HttpHeaders();

    const merged = {
      ...(defaultHeaders ?? {}),
      ...(additionalHeaders ?? {}),
      ...(requestConfig?.headers ?? {}),
    };

    for (const [key, value] of Object.entries(merged)) {
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
