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
   * OData V2 only feature.
   * Historically, PATCH method was not part of the official HTTP spec, when V1 & V2 were specified;
   * but use of PATCH was already envisioned {@link https://www.odata.org/documentation/odata-version-2-0/operations/}.
   * V3 and all following versions, specify use of PATCH method.
   *
   * If implemented, this method wil be used instead of patch to partially update models.
   * Use case: You want to reuse this client and one server can only handle MERGE,
   * but not PATCH http requests.
   *
   * @param url
   * @param data
   * @param requestConfig
   * @param additionalHeaders
   */
  merge?<ResponseModel>(
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

  /**
   * Get `Edm.Int64` and `Edm.Decimal` types as string instead of number to prevent precision loss.
   * Only applies to V4 services.
   *
   * Set by odata2ts.
   *
   * @param enabled
   */
  retrieveBigNumbersAsString(enabled: boolean): void;
}
