export interface ODataRequestConfig {
  /**
   * The request headers as plain key value pair.
   */
  headers?: Record<string, string>;
  /**
   * Additional URL query params.
   */
  params?: Record<string, string | number | boolean | Array<string | number | boolean>>;
}
