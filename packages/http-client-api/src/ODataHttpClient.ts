import { ODataResponse } from "./ODataResponseModel";

/**
 * Retrieves the configuration type for the given HTTP client.
 */
export type ODataHttpClientConfig<ClientType extends ODataHttpClient> = ClientType extends ODataHttpClient<infer Config>
  ? Config
  : never;

export interface InternalHttpClientConfig {
  /**
   * Additional headers set internally by services or HttpClient implementation.
   */
  headers?: Record<string, string>;
  /**
   * Very special option needed for FetchClient to not evaluate the response body in certain situations.
   */
  noBodyEvaluation?: boolean;
}

export interface ODataHttpClient<RequestConfig = any> {
  /**
   * Create a model or collection entry.
   *
   * @param url
   * @param data
   * @param requestConfig
   * @param config
   */
  post<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfig,
    config?: InternalHttpClientConfig
  ): ODataResponse<ResponseModel>;

  get<ResponseModel>(
    url: string,
    requestConfig?: RequestConfig,
    config?: InternalHttpClientConfig
  ): ODataResponse<ResponseModel>;

  /**
   * Replace a model.
   *
   * @param url
   * @param data
   * @param requestConfig
   * @param config
   */
  put<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfig,
    config?: InternalHttpClientConfig
  ): ODataResponse<ResponseModel>;

  /**
   * Partially update a model.
   *
   * @param url
   * @param data
   * @param requestConfig
   * @param config
   */
  patch<ResponseModel>(
    url: string,
    data: any,
    requestConfig?: RequestConfig,
    config?: InternalHttpClientConfig
  ): ODataResponse<ResponseModel>;

  /**
   * Delete a model or collection.
   *
   * @param url
   * @param requestConfig
   * @param config
   */
  delete(url: string, requestConfig?: RequestConfig, config?: InternalHttpClientConfig): ODataResponse<void>;
}
