import {
  DATA_MANIPULATION_METHODS,
  ODataClientError,
  ODataHttpClientOptions,
  ODataHttpMethods,
} from "@odata2ts/http-client-api";

export const DEFAULT_CSRF_TOKEN_KEY = "x-csrf-token";

export const FAILURE_MISSING_CSRF_URL =
  "When automatic CSRF token handling is activated, the URL must be supplied via attribute [csrfTokenFetchUrl]!";

/**
 * The state and the rules of automatic CSRF token handling, without the request that fetches the token.
 *
 * Fetching is the one part that differs per client - it needs the transport - so it is handed in as a
 * callback to {@link getToken}. Everything else is the same wherever the token is used: the token is
 * fetched once and cached, it only ever travels on requests that modify data, and a server rejecting it
 * as expired earns exactly one repetition.
 */
export class CsrfTokenHandler {
  private token: string | undefined;
  private key: string = DEFAULT_CSRF_TOKEN_KEY;

  /**
   * @param options the client options; a missing fetch URL fails here rather than on the first request
   */
  public constructor(private readonly options: ODataHttpClientOptions) {
    if (options.useCsrfProtection && !options.csrfTokenFetchUrl?.trim()) {
      throw new Error(FAILURE_MISSING_CSRF_URL);
    }
  }

  public getKey(): string {
    return this.key;
  }

  public setKey(newKey: string): void {
    this.key = newKey || DEFAULT_CSRF_TOKEN_KEY;
  }

  public getFetchUrl(): string {
    return this.options.csrfTokenFetchUrl!;
  }

  /**
   * Whether this request carries a token at all: only when protection is switched on and the request
   * modifies data, since a read has nothing to protect.
   */
  public appliesTo(method: ODataHttpMethods): boolean {
    return !!this.options.useCsrfProtection && DATA_MANIPULATION_METHODS.includes(method);
  }

  /**
   * The cached token, fetched through the given callback if none is held yet.
   */
  public async getToken(fetchToken: () => Promise<string | undefined>): Promise<string | undefined> {
    if (!this.token) {
      this.token = await fetchToken();
    }
    return this.token;
  }

  /**
   * Whether a failed request failed on an expired token, i.e. whether repeating it with a fresh one is
   * worth a try. The server says so by answering 403 with the token header set to `Required`.
   *
   * Header names are compared in lower case, since that is how every client normalizes them on the way
   * out - a custom key set in its original casing would otherwise never match.
   */
  public isExpired(error: ODataClientError, method: ODataHttpMethods): boolean {
    return this.appliesTo(method) && error.status === 403 && error.headers?.[this.key.toLowerCase()] === "Required";
  }

  /**
   * Forgets the cached token, so the next request that needs one fetches it again.
   */
  public reset(): void {
    this.token = undefined;
  }
}
