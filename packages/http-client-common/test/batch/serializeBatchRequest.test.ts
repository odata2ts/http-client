import { BatchRequestBody } from "@odata2ts/http-client-api";
import { describe, expect, test } from "vitest";
import { serializeBatchRequest } from "../../src/batch/serializeBatchRequest";

describe("serializeBatchRequest - json format", () => {
  // shape taken from server/asp-net/test/batch.http, request #1
  const body: BatchRequestBody = {
    requests: [
      { id: "1", method: "get", url: "Media?$top=1&$select=Title" },
      {
        id: "2",
        method: "patch",
        url: "Members(1)",
        headers: { "content-type": "application/json" },
        body: { Name: "Batch Alice" },
      },
      { id: "3", method: "get", url: "Members(1)?$select=Name", dependsOn: ["2"] },
    ],
  };

  test("payload is the JSON-stringified body, contentType and accept are application/json", () => {
    const result = serializeBatchRequest(body, { format: "json" });

    expect(result.contentType).toBe("application/json");
    expect(result.accept).toBe("application/json");
    expect(JSON.parse(result.payload)).toEqual(body);
  });
});
