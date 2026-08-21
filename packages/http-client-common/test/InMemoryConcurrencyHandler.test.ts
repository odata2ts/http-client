import { describe, expect, test } from "vitest";
import { InMemoryConcurrencyHandler } from "../src/InMemoryConcurrencyHandler";

describe("InMemoryConcurrencyHandler", () => {
  test("an unknown key resolves to nothing", () => {
    expect(new InMemoryConcurrencyHandler().resolve("Copies(1)")).toBeUndefined();
  });

  test("what was stored is what resolves", () => {
    const handler = new InMemoryConcurrencyHandler();
    handler.set("Copies(1)", 'W/"1"');

    expect(handler.resolve("Copies(1)")).toBe('W/"1"');
  });

  test("storing again overwrites", () => {
    const handler = new InMemoryConcurrencyHandler();
    handler.set("Copies(1)", 'W/"1"');
    handler.set("Copies(1)", 'W/"7"');

    expect(handler.resolve("Copies(1)")).toBe('W/"7"');
  });

  test("evicting forgets", () => {
    const handler = new InMemoryConcurrencyHandler();
    handler.set("Copies(1)", 'W/"1"');
    handler.evict("Copies(1)");

    expect(handler.resolve("Copies(1)")).toBeUndefined();
  });

  test("evicting an unknown key is harmless", () => {
    expect(() => new InMemoryConcurrencyHandler().evict("nope")).not.toThrow();
  });

  test("keys are distinct", () => {
    const handler = new InMemoryConcurrencyHandler();
    handler.set("Copies(1)", 'W/"1"');
    handler.set("Copies(2)", 'W/"2"');

    expect(handler.resolve("Copies(1)")).toBe('W/"1"');
    expect(handler.resolve("Copies(2)")).toBe('W/"2"');
  });

  test("blind writes resolve an unknown key to star", () => {
    const handler = new InMemoryConcurrencyHandler({ blindConcurrencyWrites: true });

    expect(handler.resolve("Copies(1)")).toBe("*");
  });

  test("blind writes do not override a known ETag", () => {
    const handler = new InMemoryConcurrencyHandler({ blindConcurrencyWrites: true });
    handler.set("Copies(1)", 'W/"1"');

    expect(handler.resolve("Copies(1)")).toBe('W/"1"');
  });

  test("blind writes resolve an evicted key to star again", () => {
    const handler = new InMemoryConcurrencyHandler({ blindConcurrencyWrites: true });
    handler.set("Copies(1)", 'W/"1"');
    handler.evict("Copies(1)");

    expect(handler.resolve("Copies(1)")).toBe("*");
  });

  test("the oldest entry goes when the cap is reached", () => {
    const handler = new InMemoryConcurrencyHandler({ maxEntries: 2 });
    handler.set("a", "1");
    handler.set("b", "2");
    handler.set("c", "3");

    expect(handler.resolve("a")).toBeUndefined();
    expect(handler.resolve("b")).toBe("2");
    expect(handler.resolve("c")).toBe("3");
  });

  test("overwriting an entry refreshes its age", () => {
    const handler = new InMemoryConcurrencyHandler({ maxEntries: 2 });
    handler.set("a", "1");
    handler.set("b", "2");
    handler.set("a", "1-again");
    handler.set("c", "3");

    // "b" is now the oldest, so it is the one that goes
    expect(handler.resolve("b")).toBeUndefined();
    expect(handler.resolve("a")).toBe("1-again");
    expect(handler.resolve("c")).toBe("3");
  });
});
