import { HttpResponseModel, ODataClientError, ODataResponse } from "@odata2ts/http-client-api";
import { ErrorMessageRetriever, retrieveErrorMessage } from "./ErrorMessageRetriever";
import { HttpMethods } from "./HttpMethods";

export interface BaseHttpClientOptions {
  /**
   * Enable automatic CSRF token handling.
   */
  useCsrfProtection?: boolean;
  /**
   * Specify the URL from which the token is fetched.
   * This could be any path to your OData service, since the token is exchanged via HTTP request headers.
   * However, it should be a fast response and usually the root URL to the OData service is a good choice.
   */
  csrfTokenFetchUrl?: string;
}

export interface InternalHttpClientConfig {
  dataType?: "json" | "blob" | "stream";
  /**
   * Additional headers set internally by services or HttpClient implementation.
   */
  headers?: Record<string, string>;
  /**
   * Very special option needed for FetchClient to not evaluate the response body in certain situations.
   */
  noBodyEvaluation?: boolean;
}

export const DEFAULT_CSRF_TOKEN_KEY = "x-csrf-token";

const EDIT_METHODS = [HttpMethods.Post, HttpMethods.Put, HttpMethods.Patch, HttpMethods.Delete];
const FAILURE_MISSING_CSRF_URL =
  "When automatic CSRF token handling is activated, the URL must be supplied via attribute [csrfTokenFetchUrl]!";
const FAILURE_MISSING_URL = "Value for URL must be provided!";
const JSON_VALUE = "application/json";

function getInternalConfigWithJsonHeaders(
  headers?: Record<string, string>,
  setContentType: boolean = true,
): InternalHttpClientConfig {
  return {
    headers: {
      Accept: JSON_VALUE,
      ...(setContentType ? { "Content-Type": JSON_VALUE } : undefined),
      ...headers,
    },
    dataType: "json",
  };
}

export abstract class BaseHttpClient<RequestConfigType> {
  private csrfToken: string | undefined;
  private csrfTokenKey = DEFAULT_CSRF_TOKEN_KEY;

  protected retrieveErrorMessage: ErrorMessageRetriever = retrieveErrorMessage;

  protected constructor(private baseOptions: BaseHttpClientOptions = { useCsrfProtection: false }) {
    if (baseOptions.useCsrfProtection && !baseOptions.csrfTokenFetchUrl?.trim()) {
      throw new Error(FAILURE_MISSING_CSRF_URL);
    }
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
   * @param internalConfig request configuration from base client including additional headers which should override end user configurations
   */
  protected abstract executeRequest<ResponseModel>(
    method: HttpMethods,
    url: string,
    data: any,
    config?: RequestConfigType,
    internalConfig?: InternalHttpClientConfig,
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
    const response = await this.sendRequest(HttpMethods.Get, fetchUrl, undefined, undefined, {
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
   * @private
   */
  private async sendRequest<ResponseModel>(
    method: HttpMethods,
    url: string,
    data: any,
    requestConfig?: RequestConfigType,
    internalConfig: InternalHttpClientConfig = {},
  ): Promise<HttpResponseModel<ResponseModel>> {
    // noinspection SuspiciousTypeOfGuard
    if (typeof url !== "string") {
      throw new Error(FAILURE_MISSING_URL);
    }

    // setup automatic CSRF token handling
    if (this.baseOptions.useCsrfProtection && EDIT_METHODS.includes(method)) {
      const [tokenKey, tokenValue] = await this.setupSecurityToken();
      if (tokenValue) {
        if (!internalConfig.headers) {
          internalConfig.headers = {};
        }
        internalConfig.headers[tokenKey] = tokenValue;
      }
    }

    try {
      return await this.executeRequest<ResponseModel>(
        method,
        url,
        data,
        requestConfig,
        Object.keys(internalConfig).length ? internalConfig : undefined,
      );
    } catch (e) {
      const clientError = e as ODataClientError;

      // automatic CSRF token handling
      if (
        !!this.baseOptions.useCsrfProtection &&
        clientError.status === 403 &&
        !!clientError.headers &&
        clientError.headers["x-csrf-token"] === "Required"
      ) {
        // token has expired: reset csrf token & perform the original request again
        this.csrfToken = undefined;
        return this.sendRequest<ResponseModel>(method, url, data, requestConfig);
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
      HttpMethods.Get,
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
      HttpMethods.Post,
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
      HttpMethods.Put,
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
      HttpMethods.Patch,
      url,
      data,
      requestConfig,
      getInternalConfigWithJsonHeaders(additionalHeaders),
    );
  }

  private getAdditionalHeaders(additionalHeaders?: Record<string, string>) {
    return additionalHeaders ? { headers: additionalHeaders } : undefined;
  }

  public delete(
    url: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): Promise<HttpResponseModel<void>> {
    return this.sendRequest<void>(
      HttpMethods.Delete,
      url,
      undefined,
      requestConfig,
      getInternalConfigWithJsonHeaders(additionalHeaders, false)
    );
  }

  public getBlob(
    url: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<Blob> {
    return this.sendRequest(HttpMethods.Get, url, undefined, requestConfig, {
      ...this.getAdditionalHeaders(additionalHeaders),
      dataType: "blob",
    });
  }

  public getStream(
    url: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<ReadableStream> {
    return this.sendRequest(HttpMethods.Get, url, undefined, requestConfig, {
      ...this.getAdditionalHeaders(additionalHeaders),
      dataType: "stream",
    });
  }

  public updateBlob(
    url: string,
    data: Blob,
    mimeType: string,
    requestConfig?: RequestConfigType,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | Blob> {
    return this.sendRequest(HttpMethods.Put, url, data, requestConfig, {
      headers: { ...additionalHeaders, Accept: mimeType, "Content-Type": mimeType },
      dataType: "blob",
    });
  }
}
