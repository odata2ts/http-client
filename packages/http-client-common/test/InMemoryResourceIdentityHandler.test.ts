import { describe, expect, test } from "vitest";
import { InMemoryResourceIdentityHandler } from "../src/InMemoryResourceIdentityHandler";

describe("InMemoryResourceIdentityHandler", () => {
  test("an unknown canonical id resolves to nothing", () => {
    expect(new InMemoryResourceIdentityHandler().resolve("Copies(1)")).toEqual([]);
  });

  test("what was recorded is what resolves", () => {
    const handler = new InMemoryResourceIdentityHandler();
    handler.record("Copies(1)", ["Media", "detail", 5, "copies", "detail", 1]);

    expect(handler.resolve("Copies(1)")).toEqual([["Media", "detail", 5, "copies", "detail", 1]]);
  });

  test("recording the same key again does not duplicate it", () => {
    const handler = new InMemoryResourceIdentityHandler();
    handler.record("Copies(1)", ["Media", "detail", 5, "copies", "detail", 1]);
    handler.record("Copies(1)", ["Media", "detail", 5, "copies", "detail", 1]);

    expect(handler.resolve("Copies(1)")).toEqual([["Media", "detail", 5, "copies", "detail", 1]]);
  });

  test("a composite key object dedups by value, independent of property insertion order", () => {
    const handler = new InMemoryResourceIdentityHandler();
    handler.record("Copies(1)", ["Copies", "detail", { MediumId: 5, InventoryNumber: 7 }]);
    handler.record("Copies(1)", ["Copies", "detail", { InventoryNumber: 7, MediumId: 5 }]);

    expect(handler.resolve("Copies(1)")).toEqual([["Copies", "detail", { MediumId: 5, InventoryNumber: 7 }]]);
  });

  test("recording two different routes to the same resource keeps both", () => {
    const handler = new InMemoryResourceIdentityHandler();
    handler.record("Copies(1)", ["Copies", "detail", 1]);
    handler.record("Copies(1)", ["Media", "detail", 5, "copies", "detail", 1]);

    expect(handler.resolve("Copies(1)")).toEqual([
      ["Copies", "detail", 1],
      ["Media", "detail", 5, "copies", "detail", 1],
    ]);
  });

  test("evicting forgets", () => {
    const handler = new InMemoryResourceIdentityHandler();
    handler.record("Copies(1)", ["Copies", "detail", 1]);
    handler.evict("Copies(1)");

    expect(handler.resolve("Copies(1)")).toEqual([]);
  });

  test("evicting an unknown id is harmless", () => {
    expect(() => new InMemoryResourceIdentityHandler().evict("nope")).not.toThrow();
  });

  test("canonical ids are distinct", () => {
    const handler = new InMemoryResourceIdentityHandler();
    handler.record("Copies(1)", ["Copies", "detail", 1]);
    handler.record("Copies(2)", ["Copies", "detail", 2]);

    expect(handler.resolve("Copies(1)")).toEqual([["Copies", "detail", 1]]);
    expect(handler.resolve("Copies(2)")).toEqual([["Copies", "detail", 2]]);
  });

  test("the oldest canonical resource goes when the entry cap is reached", () => {
    const handler = new InMemoryResourceIdentityHandler({ maxEntries: 2 });
    handler.record("a", ["A"]);
    handler.record("b", ["B"]);
    handler.record("c", ["C"]);

    expect(handler.resolve("a")).toEqual([]);
    expect(handler.resolve("b")).toEqual([["B"]]);
    expect(handler.resolve("c")).toEqual([["C"]]);
  });

  test("recording again refreshes a resource's age", () => {
    const handler = new InMemoryResourceIdentityHandler({ maxEntries: 2 });
    handler.record("a", ["A"]);
    handler.record("b", ["B"]);
    handler.record("a", ["A2"]);
    handler.record("c", ["C"]);

    // "b" is now the oldest, so it is the one that goes
    expect(handler.resolve("b")).toEqual([]);
    expect(handler.resolve("a")).toEqual([["A"], ["A2"]]);
    expect(handler.resolve("c")).toEqual([["C"]]);
  });

  test("the oldest route goes when a single resource's own key cap is reached", () => {
    const handler = new InMemoryResourceIdentityHandler({ maxKeysPerEntry: 2 });
    handler.record("a", ["route1"]);
    handler.record("a", ["route2"]);
    handler.record("a", ["route3"]);

    expect(handler.resolve("a")).toEqual([["route2"], ["route3"]]);
  });

  describe("dehydrate/hydrate", () => {
    test("dehydrate exports exactly what was recorded", () => {
      const handler = new InMemoryResourceIdentityHandler();
      handler.record("a", ["route1"]);
      handler.record("a", ["route2"]);
      handler.record("b", ["route3"]);

      expect(handler.dehydrate()).toEqual([
        ["a", [["route1"], ["route2"]]],
        ["b", [["route3"]]],
      ]);
    });

    test("hydrate restores entries into a fresh store, as though each had been recorded", () => {
      const source = new InMemoryResourceIdentityHandler();
      source.record("a", ["route1"]);
      source.record("b", ["route2"]);

      const target = new InMemoryResourceIdentityHandler();
      target.hydrate(source.dehydrate());

      expect(target.resolve("a")).toEqual([["route1"]]);
      expect(target.resolve("b")).toEqual([["route2"]]);
    });

    test("hydrate merges into, rather than replaces, what a store already has", () => {
      const handler = new InMemoryResourceIdentityHandler();
      handler.record("a", ["route1"]);

      handler.hydrate([["a", [["route2"]]]]);

      expect(handler.resolve("a")).toEqual([["route1"], ["route2"]]);
    });
  });
});
