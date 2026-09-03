import { BatchRequestBody } from "@odata2ts/http-client-api";
import { describe, expect, test } from "vitest";
import { BatchTranslationError } from "../../src/batch/BatchErrors";
import { splitMultipart } from "../../src/batch/MimeMultipart";
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

describe("serializeBatchRequest - multipart format", () => {
  test("a single top-level GET matches the CAP capture", () => {
    const result = serializeBatchRequest(
      { requests: [{ id: "0", method: "get", url: "Books?$top=1" }] },
      { format: "multipart", boundary: "b" },
    );

    expect(result.contentType).toBe("multipart/mixed; boundary=b");
    expect(result.accept).toBe("multipart/mixed");
    expect(result.payload).toBe(
      "--b\r\n" +
        "Content-Type: application/http\r\n" +
        "Content-Transfer-Encoding: binary\r\n" +
        "Content-ID: 0\r\n" +
        "\r\n" +
        "GET Books?$top=1 HTTP/1.1\r\n" +
        "\r\n" +
        "\r\n" +
        "--b--\r\n",
    );
  });

  test("a request body is JSON-stringified with a default Content-Type", () => {
    const result = serializeBatchRequest(
      { requests: [{ id: "0", method: "post", url: "People", body: { Name: "X" } }] },
      { format: "multipart", boundary: "b" },
    );

    const [part] = splitMultipart(result.payload, "b");
    expect(part.body).toContain("POST People HTTP/1.1");
    expect(part.body).toContain("Content-Type: application/json");
    expect(part.body).toContain('{"Name":"X"}');
  });

  test("an atomicity group becomes a nested change set, each member carrying Content-ID", () => {
    const result = serializeBatchRequest(
      {
        requests: [
          { id: "1", method: "post", url: "People", atomicityGroup: "g1", body: { Name: "A" } },
          { id: "2", method: "post", url: "Trips", atomicityGroup: "g1", body: { Name: "T" } },
        ],
      },
      { format: "multipart", boundary: "b" },
    );

    const [outerPart] = splitMultipart(result.payload, "b");
    expect(outerPart.headers["content-type"]).toMatch(/^multipart\/mixed; boundary=/);

    const nestedBoundary = outerPart.headers["content-type"].split("boundary=")[1];
    const nestedParts = splitMultipart(outerPart.body, nestedBoundary);
    expect(nestedParts).toHaveLength(2);
    expect(nestedParts[0].headers["content-id"]).toBe("1");
    expect(nestedParts[1].headers["content-id"]).toBe("2");
  });

  test("a dependsOn that precedes its dependent in order is emitted as nothing extra", () => {
    const result = serializeBatchRequest(
      {
        requests: [
          { id: "1", method: "post", url: "People", body: { Name: "A" } },
          { id: "2", method: "get", url: "People?$top=1", dependsOn: ["1"] },
        ],
      },
      { format: "multipart", boundary: "b" },
    );

    expect(result.payload).not.toContain("dependsOn");
  });

  test("a forward dependsOn throws", () => {
    expect(() =>
      serializeBatchRequest(
        {
          requests: [
            { id: "1", method: "get", url: "People?$top=1", dependsOn: ["2"] },
            { id: "2", method: "post", url: "People", body: { Name: "A" } },
          ],
        },
        { format: "multipart" },
      ),
    ).toThrow(BatchTranslationError);
  });

  test("a dependsOn joining two members of the same change set throws", () => {
    expect(() =>
      serializeBatchRequest(
        {
          requests: [
            { id: "1", method: "post", url: "People", atomicityGroup: "g1", body: {} },
            { id: "2", method: "post", url: "Trips", atomicityGroup: "g1", body: {}, dependsOn: ["1"] },
          ],
        },
        { format: "multipart" },
      ),
    ).toThrow(BatchTranslationError);
  });

  test("a dependsOn crossing a change-set boundary throws", () => {
    expect(() =>
      serializeBatchRequest(
        {
          requests: [
            { id: "1", method: "post", url: "People", atomicityGroup: "g1", body: {} },
            { id: "2", method: "get", url: "People?$top=1", dependsOn: ["1"] },
          ],
        },
        { format: "multipart" },
      ),
    ).toThrow(BatchTranslationError);
  });

  test("a non-contiguous atomicity group throws", () => {
    expect(() =>
      serializeBatchRequest(
        {
          requests: [
            { id: "1", method: "post", url: "People", atomicityGroup: "g1", body: {} },
            { id: "2", method: "get", url: "Trips" },
            { id: "3", method: "post", url: "People", atomicityGroup: "g1", body: {} },
          ],
        },
        { format: "multipart" },
      ),
    ).toThrow(BatchTranslationError);
  });

  test("boundary defaults to a generated one when not given", () => {
    const result = serializeBatchRequest(
      { requests: [{ id: "0", method: "get", url: "People" }] },
      { format: "multipart" },
    );
    expect(result.contentType).toMatch(/^multipart\/mixed; boundary=batch_/);
  });
});
