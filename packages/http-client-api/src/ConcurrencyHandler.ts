/**
 * Holds the ETags a client has seen, so that a later write to the same resource can carry the `If-Match`
 * header optimistic concurrency control requires (OData V4.01 Part 1, §8.3.1).
 *
 * It lives on the HTTP client rather than on a service, because it has to outlive them: a generated
 * sub-service is built per call - `myService.Copies(id)` hands back a fresh instance - so a store held by
 * a service would be gone between the read and the write.
 *
 * It holds state and nothing else. Which resource a key stands for, whether that resource is under
 * concurrency control at all, and when to store or forget an ETag are all decided in
 * `@odata2ts/odata-service`.
 */
export interface ConcurrencyHandler {
  /**
   * Remembers the ETag of a resource.
   *
   * @param key the resource, as the URL path addressing it, without query options
   * @param etag the ETag exactly as the service stated it, quotes and weak marker included
   */
  set(key: string, etag: string): void;

  /**
   * Forgets the ETag of a resource. Called after a write which did not hand back a new one: keeping the
   * old value would produce a `412` on the next write although nothing else had changed.
   */
  evict(key: string): void;

  /**
   * The value to send as `If-Match`, or `undefined` if nothing is known and the caller has to decide what
   * to do about it.
   */
  resolve(key: string): string | undefined;
}
