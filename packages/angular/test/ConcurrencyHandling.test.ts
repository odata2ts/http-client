// required so @angular/common/http's own Ivy-decorated classes can be loaded outside of an Angular CLI
// build - see the comment in AngularODataClient.test.ts for details.
import "@angular/compiler";
import { HttpClient } from "@angular/common/http";
import { ConcurrencyHandler, ODataHttpClientOptions } from "@odata2ts/http-client-api";
import { describe, expect, test, vi } from "vitest";
import { AngularODataClient } from "../src/index.js";

describe("AngularODataClient Concurrency Handling Tests", () => {
  function buildClient(options?: ODataHttpClientOptions | null) {
    const httpClientMock = { request: vi.fn(), get: vi.fn() } as unknown as HttpClient;
    return new AngularODataClient(httpClientMock, options);
  }

  test("a client always has a handler", () => {
    const client = buildClient();

    expect(client.concurrency).toBeDefined();
    expect(client.concurrency.resolve("Copies(1)")).toBeUndefined();
  });

  test("the default handler stores and resolves", () => {
    const client = buildClient();
    client.concurrency.set("Copies(1)", 'W/"1"');

    expect(client.concurrency.resolve("Copies(1)")).toBe('W/"1"');
  });

  test("blindConcurrencyWrites reaches the handler", () => {
    const client = buildClient({ blindConcurrencyWrites: true });

    expect(client.concurrency.resolve("Copies(1)")).toBe("*");
  });

  test("a supplied handler replaces the default", () => {
    const custom: ConcurrencyHandler = { set: () => {}, evict: () => {}, resolve: () => 'W/"custom"' };
    const client = buildClient({ concurrencyHandler: custom });

    expect(client.concurrency).toBe(custom);
    expect(client.concurrency.resolve("Copies(1)")).toBe('W/"custom"');
  });

  test("no options at all still yields a handler", () => {
    // the options arrive through an optional DI token, so null is a real case
    const client = buildClient(null);

    expect(client.concurrency).toBeDefined();
    client.concurrency.set("Copies(1)", 'W/"1"');
    expect(client.concurrency.resolve("Copies(1)")).toBe('W/"1"');
  });

  test("two clients keep their own store", () => {
    const one = buildClient();
    const other = buildClient();
    one.concurrency.set("Copies(1)", 'W/"1"');

    expect(other.concurrency.resolve("Copies(1)")).toBeUndefined();
  });
});
