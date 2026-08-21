import { ConcurrencyHandler } from "@odata2ts/http-client-api";

/**
 * How many resources are remembered before the oldest is dropped. An entry is two short strings, so the
 * cap is cheap insurance against a store that grows for the lifetime of a single-page-application session
 * rather than a constraint anybody is expected to feel.
 */
export const DEFAULT_MAX_ENTRIES = 10000;

export interface InMemoryConcurrencyHandlerOptions {
  /**
   * Resolve an unknown key to `*` instead of `undefined` - see `blindConcurrencyWrites` of the client
   * options.
   */
  blindConcurrencyWrites?: boolean;
  /**
   * Defaults to {@link DEFAULT_MAX_ENTRIES}.
   */
  maxEntries?: number;
}

/**
 * The default {@link ConcurrencyHandler}: a bounded map, oldest entry first out.
 *
 * A `Map` keeps its insertion order, which is what makes the bound a single loop - re-inserting a key
 * moves it to the back and thereby counts as touching it.
 */
export class InMemoryConcurrencyHandler implements ConcurrencyHandler {
  private readonly etags = new Map<string, string>();
  private readonly blindConcurrencyWrites: boolean;
  private readonly maxEntries: number;

  public constructor(options: InMemoryConcurrencyHandlerOptions = {}) {
    this.blindConcurrencyWrites = !!options.blindConcurrencyWrites;
    this.maxEntries = options.maxEntries ?? DEFAULT_MAX_ENTRIES;
  }

  public set(key: string, etag: string): void {
    // delete first, so that re-storing a key counts as touching it and moves it to the back
    this.etags.delete(key);
    this.etags.set(key, etag);

    while (this.etags.size > this.maxEntries) {
      const oldest = this.etags.keys().next();
      if (oldest.done) {
        return;
      }
      this.etags.delete(oldest.value);
    }
  }

  public evict(key: string): void {
    this.etags.delete(key);
  }

  public resolve(key: string): string | undefined {
    return this.etags.get(key) ?? (this.blindConcurrencyWrites ? "*" : undefined);
  }
}
