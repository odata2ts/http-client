import { ResourceIdentityHandler } from "@odata2ts/http-client-api";
import { describe, expect, test } from "vitest";
import { MockHttpClient } from "./MockHttpClient";

describe("Resource Identity Handling", () => {
  test("a client always has a handler", () => {
    const client = new MockHttpClient();

    expect(client.resourceIdentity).toBeDefined();
    expect(client.resourceIdentity.resolve("Copies(1)")).toStrictEqual([]);
  });

  test("the default handler records and resolves", () => {
    const client = new MockHttpClient();
    client.resourceIdentity.record("Copies(1)", ["Media", "detail", 5, "copies", "detail", 1]);

    expect(client.resourceIdentity.resolve("Copies(1)")).toStrictEqual([["Media", "detail", 5, "copies", "detail", 1]]);
  });

  test("evict forgets everything recorded for that resource", () => {
    const client = new MockHttpClient();
    client.resourceIdentity.record("Copies(1)", ["Copies", "detail", 1]);
    client.resourceIdentity.evict("Copies(1)");

    expect(client.resourceIdentity.resolve("Copies(1)")).toStrictEqual([]);
  });

  test("a supplied handler replaces the default", () => {
    const calls: Array<string> = [];
    const custom: ResourceIdentityHandler = {
      record: (id, key) => void calls.push(`record:${id}:${JSON.stringify(key)}`),
      resolve: (id) => {
        calls.push(`resolve:${id}`);
        return [["custom", "detail", 1]];
      },
      evict: (id) => void calls.push(`evict:${id}`),
      dehydrate: () => [],
      hydrate: () => {},
    };
    const client = new MockHttpClient({ resourceIdentityHandler: custom });

    expect(client.resourceIdentity).toBe(custom);
    expect(client.resourceIdentity.resolve("Copies(1)")).toStrictEqual([["custom", "detail", 1]]);
    expect(calls).toStrictEqual(["resolve:Copies(1)"]);
  });

  test("two clients keep their own store", () => {
    const one = new MockHttpClient();
    const other = new MockHttpClient();
    one.resourceIdentity.record("Copies(1)", ["Copies", "detail", 1]);

    expect(other.resourceIdentity.resolve("Copies(1)")).toStrictEqual([]);
  });
});
