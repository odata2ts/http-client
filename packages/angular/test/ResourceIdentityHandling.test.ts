// required so @angular/common/http's own Ivy-decorated classes can be loaded outside of an Angular CLI
// build - see the comment in AngularODataClient.test.ts for details.
import "@angular/compiler";
import { HttpClient } from "@angular/common/http";
import { ODataHttpClientOptions, ResourceIdentityHandler } from "@odata2ts/http-client-api";
import { describe, expect, test, vi } from "vitest";
import { AngularODataClient } from "../src/index.js";

describe("AngularODataClient Resource Identity Handling Tests", () => {
  function buildClient(options?: ODataHttpClientOptions | null) {
    const httpClientMock = { request: vi.fn(), get: vi.fn() } as unknown as HttpClient;
    return new AngularODataClient(httpClientMock, options);
  }

  test("a client always has a handler", () => {
    const client = buildClient();

    expect(client.resourceIdentity).toBeDefined();
    expect(client.resourceIdentity.resolve("Copies(1)")).toStrictEqual([]);
  });

  test("the default handler records and resolves", () => {
    const client = buildClient();
    client.resourceIdentity.record("Copies(1)", ["Copies", "detail", 1]);

    expect(client.resourceIdentity.resolve("Copies(1)")).toStrictEqual([["Copies", "detail", 1]]);
  });

  test("a supplied handler replaces the default", () => {
    const custom: ResourceIdentityHandler = {
      record: () => {},
      resolve: () => [["custom", "detail", 1]],
      evict: () => {},
      dehydrate: () => [],
      hydrate: () => {},
    };
    const client = buildClient({ resourceIdentityHandler: custom });

    expect(client.resourceIdentity).toBe(custom);
    expect(client.resourceIdentity.resolve("Copies(1)")).toStrictEqual([["custom", "detail", 1]]);
  });

  test("no options at all still yields a handler", () => {
    // the options arrive through an optional DI token, so null is a real case
    const client = buildClient(null);

    expect(client.resourceIdentity).toBeDefined();
    client.resourceIdentity.record("Copies(1)", ["Copies", "detail", 1]);
    expect(client.resourceIdentity.resolve("Copies(1)")).toStrictEqual([["Copies", "detail", 1]]);
  });

  test("two clients keep their own store", () => {
    const one = buildClient();
    const other = buildClient();
    one.resourceIdentity.record("Copies(1)", ["Copies", "detail", 1]);

    expect(other.resourceIdentity.resolve("Copies(1)")).toStrictEqual([]);
  });
});
