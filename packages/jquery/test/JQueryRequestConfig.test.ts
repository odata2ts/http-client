import { describe, expect, test } from "vitest";
import { mergeConfigs } from "../src/JQueryRequestConfig";

describe("JQueryRequestConfig Tests", function () {
  test("merge without any config", () => {
    expect(mergeConfigs()).toStrictEqual({ headers: {} });
    expect(mergeConfigs(undefined, undefined)).toStrictEqual({ headers: {} });
  });

  test("merge one config", () => {
    const config = { timeout: 666, headers: { a: "1" } };

    expect(mergeConfigs(config)).toStrictEqual(config);
    expect(mergeConfigs(undefined, config)).toStrictEqual(config);
  });

  test("the second config wins", () => {
    const config = { timeout: 666, headers: { a: "1", b: "2" } };
    const toMerge = { timeout: 777, headers: { b: "overridden" } };

    expect(mergeConfigs(config, toMerge)).toStrictEqual({
      timeout: 777,
      headers: { a: "1", b: "overridden" },
    });
  });
});
