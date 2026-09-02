/**
 * This model represents the response for any completed HTTP request.
 */
export interface HttpResponseModel<T> {
  /** status code, e.g. 200 or 404 */
  status: number;
  /** status text, e.g. 200 = "OK" or 404 = "Not Found" */
  statusText: string;
  /** response headers as key value pairs */
  headers: { [key: string]: string };
  // config?: any;
  /** response data */
  data: T;
  /**
   * This array describes the caching keys that have been invalidated by this
   * request. Absent on reads and only populated when enabled via configuration.
   *
   * The HTTP client implementation (fetch, axios, jQuery, Angular) never sets it, only odata2ts's own response
   * handling populates it.
   *
   * **For an action this is a lower bound, not a statement.** OData has no way to declare what an
   * action changes, so an action contributes the same entries as any other write on its bound
   * resource and nothing more.
   */
  readonly invalidates?: ReadonlyArray<ReadonlyArray<unknown>>;
}

/**
 * Wrapping response instance, containing status code info, headers
 * and the response body.
 */
export type ODataResponse<T> = Promise<HttpResponseModel<T>>;
