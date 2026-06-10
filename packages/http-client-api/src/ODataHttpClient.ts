import { ODataHttpMethods } from "./ODataHttpMethods";
import { ODataRequestConfig } from "./ODataRequestConfig";
import { ODataResponse } from "./ODataResponseModel";

/**
 * Retrieves the configuration type for the given HTTP client.
 */
export type ODataHttpClientConfig<ClientType extends ODataHttpClient<any>> =
  ClientType extends ODataHttpClient<infer Config> ? Config : never;

export interface ODataHttpClient<RequestConfig extends ODataRequestConfig = ODataRequestConfig> {
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
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<ResponseModel>;

  get<ResponseModel>(
    url: string,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>,
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
    additionalHeaders?: Record<string, string>,
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
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<ResponseModel>;

  /**
   * Delete a model or collection.
   *
   * @param url
   * @param requestConfig
   * @param additionalHeaders
   */
  delete(url: string, requestConfig?: RequestConfig, additionalHeaders?: Record<string, string>): ODataResponse<void>;

  /**
   * Generic function to call one of the above methods via method enum.
   *
   * @param url
   * @param method
   * @param data
   * @param requestConfig
   * @param additionalHeaders
   */
  request<ResponseModel>(
    url: string,
    method: ODataHttpMethods,
    data: any,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<ResponseModel>;

  /**
   * Get binary data (Edm.Stream) as Blob.
   *
   * @param url
   * @param requestConfig
   * @param additionalHeaders
   */
  getBlob(url: string, requestConfig?: RequestConfig, additionalHeaders?: Record<string, string>): ODataResponse<Blob>;

  /**
   * Get binary data (Edm.Stream) as ReadableStream.
   *
   * Cannot be supported by HTTP clients based on XmlHttpRequest, e.g. axios.
   * Should throw an error in this case.
   *
   * @param url
   * @param requestConfig
   * @param additionalHeaders
   */
  getStream(
    url: string,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<ReadableStream>;

  /**
   * Creates binary data (Edm.Stream).
   *
   * @param url
   * @param data
   * @param mimeType
   * @param requestConfig
   * @param additionalHeaders
   */
  createBlob(
    url: string,
    data: Blob,
    mimeType: string,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | Blob>;

  /**
   * Updates binary data (Edm.Stream).
   *
   * @param url
   * @param data
   * @param mimeType
   * @param requestConfig
   * @param additionalHeaders
   */
  updateBlob(
    url: string,
    data: Blob,
    mimeType: string,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | Blob>;
}
