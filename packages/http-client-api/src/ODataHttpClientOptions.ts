import { ConcurrencyHandler } from "./ConcurrencyHandler";
import { ResourceIdentityHandler } from "./ResourceIdentityHandler";

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
  /**
   * Write to a resource under optimistic concurrency control even when no ETag is known for it, by
   * sending `If-Match: *` instead of failing (OData V4.01 Part 1, §8.2.1 - services MAY reject it).
   *
   * This is last-write-wins on purpose, for data imports and scripts. It does not switch the feature off:
   * it changes what an unknown ETag resolves to. Off by default, in which case a write to a
   * concurrency-controlled resource whose ETag was never read fails before the request is sent.
   */
  blindConcurrencyWrites?: boolean;
  /**
   * Replaces the default in-memory ETag store. Supply one to bound it differently, or to keep ETags
   * across a page reload.
   */
  concurrencyHandler?: ConcurrencyHandler;
  /**
   * Replaces the default in-memory {@link ResourceIdentityHandler}. Supply one to bound it differently, to
   * keep its mappings across a page reload, or to seed it with entries {@link ResourceIdentityHandler.dehydrate}
   * produced elsewhere (e.g. server-side).
   */
  resourceIdentityHandler?: ResourceIdentityHandler;
}
