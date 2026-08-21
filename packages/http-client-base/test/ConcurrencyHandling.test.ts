import { ConcurrencyHandler } from "@odata2ts/http-client-api";
import { describe, expect, test } from "vitest";
import { MockHttpClient } from "./MockHttpClient";

describe("Concurrency Handling", () => {
  test("a client always has a handler", () => {
    const client = new MockHttpClient();

    expect(client.concurrency).toBeDefined();
    expect(client.concurrency.resolve("Copies(1)")).toBeUndefined();
  });

  test("the default handler stores and resolves", () => {
    const client = new MockHttpClient();
    client.concurrency.set("Copies(1)", 'W/"1"');

    expect(client.concurrency.resolve("Copies(1)")).toBe('W/"1"');
  });

  test("blindConcurrencyWrites reaches the handler", () => {
    const client = new MockHttpClient({ blindConcurrencyWrites: true });

    expect(client.concurrency.resolve("Copies(1)")).toBe("*");
  });

  test("a supplied handler replaces the default", () => {
    const calls: Array<string> = [];
    const custom: ConcurrencyHandler = {
      set: (key) => void calls.push(`set:${key}`),
      evict: (key) => void calls.push(`evict:${key}`),
      resolve: (key) => {
        calls.push(`resolve:${key}`);
        return 'W/"custom"';
      },
    };
    const client = new MockHttpClient({ concurrencyHandler: custom });

    expect(client.concurrency).toBe(custom);
    expect(client.concurrency.resolve("Copies(1)")).toBe('W/"custom"');
    expect(calls).toStrictEqual(["resolve:Copies(1)"]);
  });

  test("a supplied handler is used as it is, blind writes or not", () => {
    const custom: ConcurrencyHandler = { set: () => {}, evict: () => {}, resolve: () => undefined };
    const client = new MockHttpClient({ blindConcurrencyWrites: true, concurrencyHandler: custom });

    // the flag configures the default handler; it is not applied on top of somebody else's
    expect(client.concurrency.resolve("Copies(1)")).toBeUndefined();
  });

  test("two clients keep their own store", () => {
    const one = new MockHttpClient();
    const other = new MockHttpClient();
    one.concurrency.set("Copies(1)", 'W/"1"');

    expect(other.concurrency.resolve("Copies(1)")).toBeUndefined();
  });
});
