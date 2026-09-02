import { describe, expectTypeOf, test } from "vitest";
import { ODataHttpClient, ODataRequestConfig, ODataResponse } from "../src";

describe("ODataHttpClient batch() contract", () => {
  test("batch() is optional - a client omitting it still satisfies the interface", () => {
    const minimal: ODataHttpClient<ODataRequestConfig> = {
      get: () => Promise.resolve({} as any),
      post: () => Promise.resolve({} as any),
      put: () => Promise.resolve({} as any),
      patch: () => Promise.resolve({} as any),
      delete: () => Promise.resolve({} as any),
      request: () => Promise.resolve({} as any),
      getBlob: () => Promise.resolve({} as any),
      getStream: () => Promise.resolve({} as any),
      createBlob: () => Promise.resolve({} as any),
      updateBlob: () => Promise.resolve({} as any),
      createStream: () => Promise.resolve({} as any),
      updateStream: () => Promise.resolve({} as any),
    };

    expectTypeOf(minimal.batch).toEqualTypeOf<ODataHttpClient["batch"]>();
  });

  test("batch(), when present, returns a canonical BatchResponseBody", () => {
    type BatchReturn = ReturnType<NonNullable<ODataHttpClient["batch"]>>;
    expectTypeOf<BatchReturn>().resolves.toHaveProperty("data");
  });
});
