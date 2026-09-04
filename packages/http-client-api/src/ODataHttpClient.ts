import { BatchClientOptions, BatchRequestBody, BatchResponseBody } from "./BatchTypes";
import { ConcurrencyHandler } from "./ConcurrencyHandler";
import { ODataHttpMethods } from "./ODataHttpMethods";
import { ODataRequestConfig } from "./ODataRequestConfig";
import { ODataResponse } from "./ODataResponseModel";
import { ResourceIdentityHandler } from "./ResourceIdentityHandler";

/**
 * Retrieves the configuration type for the given HTTP client.
 */
export type ODataHttpClientConfig<ClientType extends ODataHttpClient<any>> =
  ClientType extends ODataHttpClient<infer Config> ? Config : never;

export interface ODataHttpClient<RequestConfig extends ODataRequestConfig = ODataRequestConfig> {
  /**
   * The ETags this client has seen, if it supports optimistic concurrency control.
   *
   * Optional on purpose: a client implementation predating this, or one which simply has no use for it,
   * still satisfies the contract. `@odata2ts/odata-service` treats its absence as "no ETag is ever known".
   */
  readonly concurrency?: ConcurrencyHandler;

  /**
   * The route↔canonical-resource mappings this client has observed, if it supports response-observed
   * cache invalidation - see {@link ResourceIdentityHandler}.
   *
   * Optional on purpose, for the same reason {@link concurrency} is: `@odata2ts/odata-service` treats its
   * absence as "no mapping is ever known".
   */
  readonly resourceIdentity?: ResourceIdentityHandler;

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
   * Sends a collected set of requests as a single OData batch request (`$batch`).
   *
   * Required, unlike {@link concurrency}: a client that cannot or will not support batching must still
   * implement this and throw a clear error explaining why, rather than silently omitting it and leaving
   * every caller of `@odata2ts/odata-service` to discover the gap at first use.
   *
   * @param url the batch endpoint, e.g. "$batch"
   * @param body the canonical batch request
   * @param options
   * @param requestConfig
   * @param additionalHeaders
   */
  batch(
    url: string,
    body: BatchRequestBody,
    options?: BatchClientOptions,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<BatchResponseBody>;

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

  /**
   * Creates binary data (Edm.Stream) from a ReadableStream, so that the payload does not have to be
   * held in memory as a whole.
   *
   * Cannot be supported by HTTP clients based on XmlHttpRequest, e.g. axios.
   * Should throw an error in this case.
   *
   * @param url
   * @param data
   * @param mimeType
   * @param requestConfig
   * @param additionalHeaders
   */
  createStream(
    url: string,
    data: ReadableStream,
    mimeType: string,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | ReadableStream>;

  /**
   * Updates binary data (Edm.Stream) from a ReadableStream, so that the payload does not have to be
   * held in memory as a whole.
   *
   * Cannot be supported by HTTP clients based on XmlHttpRequest, e.g. axios.
   * Should throw an error in this case.
   *
   * @param url
   * @param data
   * @param mimeType
   * @param requestConfig
   * @param additionalHeaders
   */
  updateStream(
    url: string,
    data: ReadableStream,
    mimeType: string,
    requestConfig?: RequestConfig,
    additionalHeaders?: Record<string, string>,
  ): ODataResponse<void | ReadableStream>;
}
