import { BatchRequestBody } from "@odata2ts/http-client-api";
import { describe, expect, test } from "vitest";
import { parseBatchResponse } from "../../src/batch/parseBatchResponse";

describe("parseBatchResponse - json format", () => {
  const request: BatchRequestBody = {
    requests: [
      { id: "1", method: "get", url: "Media?$top=1&$select=Title" },
      { id: "2", method: "patch", url: "Members(1)", body: { Name: "Batch Alice" } },
    ],
  };

  const responseJson = {
    responses: [
      { id: "1", status: 200, headers: { "content-type": "application/json" }, body: { value: [{ Title: "X" }] } },
      { id: "2", status: 204 },
    ],
  };

  test('resolvedBy is always "id" for json batch (§19.5)', () => {
    const result = parseBatchResponse(responseJson, request, { format: "json" });
    expect(result.resolvedBy).toBe("id");
    expect(result.responses).toEqual(responseJson.responses);
  });

  test("accepts the response pre-parsed or as a raw JSON string", () => {
    const fromString = parseBatchResponse(JSON.stringify(responseJson), request, { format: "json" });
    expect(fromString).toEqual(parseBatchResponse(responseJson, request, { format: "json" }));
  });
});
