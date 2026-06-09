export interface ODataHttpClientOptions {
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
