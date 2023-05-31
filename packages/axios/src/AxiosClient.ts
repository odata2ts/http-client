import { HttpResponseModel, ODataClient } from "@odata2ts/odata-client-api";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig as OriginalRequestConfig } from "axios";

import { AxiosClientError } from "./AxiosClientError";
import { AxiosRequestConfig, InternalRequestConfig, getDefaultConfig, mergeConfig } from "./AxiosRequestConfig";

export type ErrorMessageRetriever<ResponseType = any> = (error: any) => string | null | undefined;

export interface ClientOptions {
  useCsrfProtection?: boolean;
  csrfTokenFetchUrl?: string;
}

export const DEFAULT_ERROR_MESSAGE = "No error message!";
const FAILURE_MISSING_CSRF_URL =
  "When automatic CSRF token handling is activated, the URL must be supplied via attribute [csrfTokenFetchUrl]!";
const FAILURE_NO_RESPONSE = "No response from server! Failure: ";
const FAILURE_NO_REQUEST = "No request was sent! Failure: ";
const FAILURE_RESPONSE_MESSAGE = "OData server responded with error: ";
const FAILURE_AXIOS = "Fatal Axios failure: ";

function buildErrorMessage(prefix: string, error: any) {
  const msg = typeof error === "string" ? error : (error as Error)?.message;
  return prefix + (msg || DEFAULT_ERROR_MESSAGE);
}

export const getV2OrV4ErrorMessage: ErrorMessageRetriever = (responseData: any): string | undefined => {
  const eMsg = responseData?.error?.message;
  return typeof eMsg?.value === "string" ? eMsg.value : eMsg;
};

export class AxiosClient implements ODataClient<AxiosRequestConfig> {
  private readonly client: AxiosInstance;
  private csrfToken: string | undefined;
  private getErrorMessage: ErrorMessageRetriever = getV2OrV4ErrorMessage;

  constructor(config?: AxiosRequestConfig, private clientOptions?: ClientOptions) {
    this.client = axios.create(getDefaultConfig(config));

    if (clientOptions && clientOptions.useCsrfProtection && !clientOptions.csrfTokenFetchUrl?.trim()) {
      throw new Error(FAILURE_MISSING_CSRF_URL);
    }
  }

  public setErrorMessageRetriever<T = any>(getErrorMsg: ErrorMessageRetriever<T>) {
    this.getErrorMessage = getErrorMsg;
  }

  private async setupSecurityToken() {
    if (!this.csrfToken) {
      this.csrfToken = await this.fetchSecurityToken();
    }
    return this.csrfToken;
  }

  private async fetchSecurityToken(): Promise<string | undefined> {
    const fetchUrl = this.clientOptions!.csrfTokenFetchUrl!;
    const response = await this.get(fetchUrl, { headers: { "x-csrf-token": "Fetch" } });

    return response.headers["x-csrf-token"];
  }

  private async sendRequest<ResponseType>(config: InternalRequestConfig): Promise<HttpResponseModel<ResponseType>> {
    if (typeof config.url !== "string") {
      throw new Error("Value for URL must be provided!");
    }

    // setup automatic CSRF token handling
    if (
      this.clientOptions?.useCsrfProtection &&
      ["POST", "PUT", "PATCH", "DELETE"].includes(config.method!.toUpperCase())
    ) {
      const csrfToken = await this.setupSecurityToken();
      if (typeof csrfToken === "string") {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers!["x-csrf-token"] = csrfToken;
      }
    }

    try {
      return await this.client.request(config as OriginalRequestConfig);
    } catch (error: any) {
      if ((error as AxiosError).isAxiosError) {
        const axiosError = error as AxiosError;

        // automatic CSRF token handling
        // csrf token expired, let's reset it and perform the original request again
        if (
          this.clientOptions?.useCsrfProtection &&
          axiosError.response?.status === 403 &&
          axiosError.response.headers["x-csrf-token"] === "Required"
        ) {
          this.csrfToken = undefined;
          return this.sendRequest<ResponseType>(config);
        }

        // regular failure handling
        if (axiosError.response) {
          const msg = buildErrorMessage(FAILURE_RESPONSE_MESSAGE, this.getErrorMessage(axiosError.response.data));
          throw new AxiosClientError(msg, axiosError.response.status, axiosError);
        }
        // fatal failure without response
        else {
          throw new AxiosClientError(
            buildErrorMessage(axiosError.request ? FAILURE_NO_RESPONSE : FAILURE_NO_REQUEST, axiosError),
            undefined,
            axiosError
          );
        }
      }
      // not an Axios error
      throw new AxiosClientError(buildErrorMessage(FAILURE_AXIOS, error), undefined, error);
    }
  }

  public post<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: AxiosRequestConfig
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest({ ...requestConfig, url, data, method: "POST" });
  }
  public get<ResponseModel>(
    url: string,
    requestConfig?: AxiosRequestConfig
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest({ ...requestConfig, url, method: "GET" });
  }
  public put<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: AxiosRequestConfig
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest({ ...requestConfig, url, data, method: "PUT" });
  }
  public patch<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: AxiosRequestConfig
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest({ ...requestConfig, url, data, method: "PATCH" });
  }
  public merge<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: AxiosRequestConfig
  ): Promise<HttpResponseModel<ResponseModel>> {
    return this.sendRequest(
      mergeConfig(requestConfig, {
        url,
        method: "POST",
        headers: { "X-Http-Method": "MERGE" },
        data,
      })
    );
  }
  public delete(url: string, requestConfig?: AxiosRequestConfig): Promise<HttpResponseModel<void>> {
    return this.sendRequest({ ...requestConfig, url, method: "DELETE" });
  }
}
