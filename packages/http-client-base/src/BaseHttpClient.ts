import { HttpResponseModel, ODataHttpClient } from "@odata2ts/http-client-api";

import { ErrorMessageRetriever, retrieveErrorMessage } from "./ErrorMessageRetriever";
import { HttpMethods } from "./HttpMethods";

export interface BaseHttpClientOptions {
  useCsrfProtection?: boolean;
  csrfTokenFetchUrl?: string;
}

export const DEFAULT_CSRF_TOKEN_KEY = "x-csrf-token";

const EDIT_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
const FAILURE_MISSING_CSRF_URL =
  "When automatic CSRF token handling is activated, the URL must be supplied via attribute [csrfTokenFetchUrl]!";
const FAILURE_MISSING_URL = "Value for URL must be provided!";

export abstract class BaseHttpClient<RequestConfigType> implements ODataHttpClient<RequestConfigType> {
  private csrfToken: string | undefined;
  private csrfTokenKey = DEFAULT_CSRF_TOKEN_KEY;

  protected retrieveErrorMessage: ErrorMessageRetriever = retrieveErrorMessage;

  protected constructor(private baseOptions: BaseHttpClientOptions = { useCsrfProtection: false }) {
    if (baseOptions.useCsrfProtection && !baseOptions.csrfTokenFetchUrl?.trim()) {
      throw new Error(FAILURE_MISSING_CSRF_URL);
    }
  }

  abstract addHeaderToRequestConfig(headers: Record<string, string>, config?: RequestConfigType): RequestConfigType;

  abstract executeRequest<ResponseModel>(
    method: HttpMethods,
    url: string,
    data: any,
    config?: RequestConfigType
  ): Promise<HttpResponseModel<ResponseModel>>;

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
    const response = await this.get(fetchUrl, this.addHeaderToRequestConfig({ [this.csrfTokenKey]: "Fetch" }));

    return response.headers[this.csrfTokenKey];
  }

  protected isRefreshNecessary(status: number, headers?: Record<string, string>): boolean {
    const result =
      !!this.baseOptions.useCsrfProtection && status === 403 && !!headers && headers["x-csrf-token"] === "Required";

    if (result) {
      this.csrfToken = undefined;
    }
    return result;
  }

  /**
   * Follows the template pattern.
   *
   * @param method
   * @param url
   * @param data
   * @param requestConfig
   * @private
   */
  protected async sendRequest<ResponseModel>(
    method: HttpMethods,
    url: string,
    data: any,
    requestConfig?: RequestConfigType
  ) {
    // noinspection SuspiciousTypeOfGuard
    if (typeof url !== "string") {
      throw new Error(FAILURE_MISSING_URL);
    }

    // setup automatic CSRF token handling
    if (this.baseOptions.useCsrfProtection && EDIT_METHODS.includes(method)) {
      const [tokenKey, tokenValue] = await this.setupSecurityToken();
      if (tokenValue) {
        this.addHeaderToRequestConfig({ [tokenKey]: tokenValue }, requestConfig);
      }
    }

    try {
      return this.executeRequest<ResponseModel>(method, url, data, requestConfig);
    } catch (e) {
      throw e;
    }
  }

  public get<ResponseModel>(url: string, requestConfig?: RequestConfigType): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(HttpMethods.Get, url, undefined, requestConfig);
  }
  public post<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfigType
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(HttpMethods.Post, url, data, requestConfig);
  }
  public put<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfigType
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(HttpMethods.Put, url, data, requestConfig);
  }
  public patch<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfigType
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(HttpMethods.Patch, url, data, requestConfig);
  }
  public merge<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfigType
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest<ResponseModel>(
      HttpMethods.Post,
      url,
      data,
      this.addHeaderToRequestConfig({ "X-Http-Method": "MERGE" }, requestConfig)
    );
  }

  public delete(url: string, requestConfig?: RequestConfigType): Promise<HttpResponseModel<void>> {
    return this.sendRequest<void>(HttpMethods.Delete, url, undefined, requestConfig);
  }
}
