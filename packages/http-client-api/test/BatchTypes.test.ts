import { describe, expectTypeOf, test } from "vitest";
import { ODataHttpClient, ODataRequestConfig, ODataResponse } from "../src";

describe("ODataHttpClient batch() contract", () => {
  test("batch() is required - a client omitting it does not satisfy the interface", () => {
    // @ts-expect-error - batch is required; a client without it must fail to type-check, not silently
    // satisfy ODataHttpClient. A client that cannot support batching still has to implement it and throw.
    const missingBatch: ODataHttpClient<ODataRequestConfig> = {
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
    void missingBatch;
  });

  test("batch() returns a canonical BatchResponseBody", () => {
    type BatchReturn = ReturnType<ODataHttpClient["batch"]>;
    expectTypeOf<BatchReturn>().resolves.toHaveProperty("data");
  });
});
