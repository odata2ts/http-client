/**
 * Records which hierarchical cache keys were observed to resolve to which canonical resource, so that a
 * write reached via one route can invalidate a cache key reached via a completely different route to the
 * very same resource (OData v4.01 Part 2 §4.3.1's canonical URL: entity-set name + key predicate).
 *
 * It lives on the HTTP client rather than on a service, for the same reason {@link ConcurrencyHandler}
 * does: it has to outlive them, since a generated sub-service is built fresh per call.
 *
 * It holds state and nothing else. Which resource a response was actually about, when to record a
 * mapping, and how to fold what `resolve` returns into a write's `invalidates` are all decided in
 * `@odata2ts/odata-service` - this store never inspects a response or a cache key itself.
 */
export interface ResourceIdentityHandler {
  /**
   * Records that this specific hierarchical cache key resolved, in an actual response, to this canonical
   * resource. Called once per entity present in a response - the directly addressed one and every
   * `$expand`'d one, however deep - never for a contained entity, which has no canonical resource of its
   * own to record against.
   *
   * @param canonicalId the resource's own canonical-URL segment, e.g. `Copies(3)` or
   *   `Copies(Id=1,Category='books')` - the same encoding `ConcurrencyHandler`'s ETag keys already use
   * @param hierarchicalKey the request's own cache key that reached this resource, route-shaped (query
   *   params stripped) so one entry already covers every filtered/paginated variant a cache library's own
   *   fuzzy key matching would reach anyway
   */
  record(canonicalId: string, hierarchicalKey: ReadonlyArray<unknown>): void;

  /**
   * Every hierarchical cache key ever recorded as resolving to this canonical resource - what a write
   * folds into its own `invalidates`, alongside the entries its own route already produces.
   */
  resolve(canonicalId: string): ReadonlyArray<ReadonlyArray<unknown>>;

  /** Forgets everything recorded for this canonical resource, e.g. after a delete. */
  evict(canonicalId: string): void;

  /**
   * Every mapping this store currently holds, for hydration elsewhere - an SSR response hydrating a
   * client's store with what the server already observed, or a store persisted across sessions. Mirrors
   * TanStack Query's own `dehydrate`/`hydrate`: bulk transfer of exactly what {@link record}/{@link resolve}
   * already traffic in, no new shape.
   */
  dehydrate(): ReadonlyArray<readonly [canonicalId: string, hierarchicalKeys: ReadonlyArray<ReadonlyArray<unknown>>]>;

  /**
   * Bulk-imports previously {@link dehydrate}d entries, exactly as though each hierarchical key had been
   * {@link record}ed individually.
   *
   * Deliberately the only form of seeding this store supports: populating a mapping from data this store
   * (or another instance of it) has genuinely observed before, never a static prediction of a mapping
   * nothing has actually read yet - that would need the referential-constraint reasoning this design
   * replaces, not reintroduce.
   */
  hydrate(
    entries: ReadonlyArray<readonly [canonicalId: string, hierarchicalKeys: ReadonlyArray<ReadonlyArray<unknown>>]>,
  ): void;
}
