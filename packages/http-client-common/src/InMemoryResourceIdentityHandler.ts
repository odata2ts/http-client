import { ResourceIdentityHandler } from "@odata2ts/http-client-api";

/**
 * How many canonical resources are remembered before the oldest is dropped - the same reasoning as
 * `DEFAULT_MAX_ENTRIES` in `InMemoryConcurrencyHandler`: cheap insurance against unbounded growth
 * over a single-page-application's lifetime, not a constraint anybody is expected to feel.
 */
export const DEFAULT_MAX_RESOURCE_ENTRIES = 10000;

/**
 * How many distinct hierarchical keys are remembered per canonical resource before the oldest is dropped.
 * Bounded independently of {@link DEFAULT_MAX_RESOURCE_ENTRIES}: a single popular entity read through many
 * differently-filtered/paginated routes could otherwise grow one entry without bound even while the number
 * of distinct resources stays small.
 */
export const DEFAULT_MAX_KEYS_PER_ENTRY = 100;

export interface InMemoryResourceIdentityHandlerOptions {
  /** Defaults to {@link DEFAULT_MAX_RESOURCE_ENTRIES}. */
  maxEntries?: number;
  /** Defaults to {@link DEFAULT_MAX_KEYS_PER_ENTRY}. */
  maxKeysPerEntry?: number;
}

/**
 * A stable, order-insensitive string for a hierarchical key: two composite-key objects with the same
 * entries in a different insertion order (`{a:1,b:2}` vs `{b:2,a:1}`) must dedup to the same entry, since
 * both name the very same request. Recurses into arrays and plain objects; anything else falls back to
 * `String(value)`.
 */
function stableKeyOf(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableKeyOf).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableKeyOf(v)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? String(value);
}

/**
 * The default {@link ResourceIdentityHandler}: a two-level bounded map, oldest entry first out at both
 * levels - the same insertion-order-as-LRU trick `InMemoryConcurrencyHandler` uses, applied once for which
 * canonical resources are remembered and once, per resource, for which routes to it are.
 */
export class InMemoryResourceIdentityHandler implements ResourceIdentityHandler {
  private readonly resources = new Map<string, Map<string, ReadonlyArray<unknown>>>();
  private readonly maxEntries: number;
  private readonly maxKeysPerEntry: number;

  public constructor(options: InMemoryResourceIdentityHandlerOptions = {}) {
    this.maxEntries = options.maxEntries ?? DEFAULT_MAX_RESOURCE_ENTRIES;
    this.maxKeysPerEntry = options.maxKeysPerEntry ?? DEFAULT_MAX_KEYS_PER_ENTRY;
  }

  public record(canonicalId: string, hierarchicalKey: ReadonlyArray<unknown>): void {
    // delete first, so that re-recording a resource counts as touching it and moves it to the back
    const existing = this.resources.get(canonicalId);
    this.resources.delete(canonicalId);

    const keys = existing ?? new Map<string, ReadonlyArray<unknown>>();
    const keyId = stableKeyOf(hierarchicalKey);
    keys.delete(keyId);
    keys.set(keyId, hierarchicalKey);
    while (keys.size > this.maxKeysPerEntry) {
      const oldest = keys.keys().next();
      if (oldest.done) {
        break;
      }
      keys.delete(oldest.value);
    }

    this.resources.set(canonicalId, keys);
    while (this.resources.size > this.maxEntries) {
      const oldest = this.resources.keys().next();
      if (oldest.done) {
        return;
      }
      this.resources.delete(oldest.value);
    }
  }

  public resolve(canonicalId: string): ReadonlyArray<ReadonlyArray<unknown>> {
    return [...(this.resources.get(canonicalId)?.values() ?? [])];
  }

  public evict(canonicalId: string): void {
    this.resources.delete(canonicalId);
  }

  public dehydrate(): ReadonlyArray<readonly [string, ReadonlyArray<ReadonlyArray<unknown>>]> {
    return [...this.resources.entries()].map(([canonicalId, keys]) => [canonicalId, [...keys.values()]] as const);
  }

  public hydrate(entries: ReadonlyArray<readonly [string, ReadonlyArray<ReadonlyArray<unknown>>]>): void {
    for (const [canonicalId, hierarchicalKeys] of entries) {
      for (const hierarchicalKey of hierarchicalKeys) {
        this.record(canonicalId, hierarchicalKey);
      }
    }
  }
}
