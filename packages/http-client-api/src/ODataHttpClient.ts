import { ODataResponse } from "./ODataResponseModel";

/**
 * Retrieves the configuration type for the given HTTP client.
 */
export type ODataHttpClientConfig<ClientType extends ODataHttpClient> = ClientType extends ODataHttpClient<infer Config>
  ? Config
  : never;

export interface ODataHttpClient<RequestConfig = any> {
  /**
   * Create a model or collection entry.
   *
   * @param url
   * @param data
   * @param requestConfig
   * @param additionalHeaders
   */
  post<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>
  ): ODataResponse<ResponseModel>;

  get<ResponseModel>(
    url: string,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>
  ): ODataResponse<ResponseModel>;

  /**
   * Replace a model.
   *
   * @param url
   * @param data
   * @param requestConfig
   * @param additionalHeaders
   */
  put<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>
  ): ODataResponse<ResponseModel>;

  /**
   * Partially update a model.
   *
   * @param url
   * @param data
   * @param requestConfig
   * @param additionalHeaders
   */
  patch<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>
  ): ODataResponse<ResponseModel>;

  /**
   * Delete a model or collection.
   *
   * @param url
   * @param requestConfig
   * @param additionalHeaders
   */
  delete(url: string, requestConfig?: RequestConfig, additionalHeaders?: Record<string, string>): ODataResponse<void>;
}
