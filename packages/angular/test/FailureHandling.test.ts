// required so @angular/common/http's own Ivy-decorated classes can be loaded outside of an Angular CLI
// build - see the comment in AngularODataClient.test.ts for details.
import "@angular/compiler";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { throwError } from "rxjs";
import { beforeEach, describe, expect, test } from "vitest";
import { AngularODataClient, AngularODataError, DEFAULT_ERROR_MESSAGE } from "../src/index.js";

describe("AngularODataClient Failure Handling Tests", () => {
  let client: AngularODataClient;
  let errorToThrow: HttpErrorResponse;

  beforeEach(() => {
    const httpClientMock = {
      request: () => throwError(() => errorToThrow),
      get: () => throwError(() => errorToThrow),
    } as unknown as HttpClient;
    client = new AngularODataClient(httpClientMock);
  });

  test("V4 error message is extracted from the response body", async () => {
    errorToThrow = new HttpErrorResponse({
      status: 400,
      statusText: "Bad Request",
      error: { error: { message: "oh no!" } },
      headers: new HttpHeaders({ "content-type": "application/json" }),
    });

    try {
      await client.get("");
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AngularODataError);

      const error = e as AngularODataError;
      expect(error.name).toBe("AngularODataError");
      expect(error.status).toBe(400);
      expect(error.headers).toStrictEqual({ "content-type": "application/json" });
      expect(error.message).toContain("oh no!");
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause?.message).toBe("oh no!");
      expect(error.angularError).toBe(errorToThrow);
    }
  });

  test("V2 error message is extracted from the nested value", async () => {
    errorToThrow = new HttpErrorResponse({
      status: 400,
      error: { error: { message: { value: "oh no v2!" } } },
    });

    await expect(client.get("")).rejects.toThrow("oh no v2!");
  });

  test("generic failure message when the body carries no message", async () => {
    errorToThrow = new HttpErrorResponse({ status: 500, error: {} });

    await expect(client.get("")).rejects.toThrow(DEFAULT_ERROR_MESSAGE);
  });

  test("a plain-text or unparsable error body falls back to the default message", async () => {
    errorToThrow = new HttpErrorResponse({ status: 500, error: "<html>not json</html>" });

    await expect(client.get("")).rejects.toThrow(DEFAULT_ERROR_MESSAGE);
  });

  /**
   * status 0 is how Angular reports that the request never reached a server at all (network failure,
   * CORS, timeout, ...). There is no OData error document to parse in that case, so the message and cause
   * differ from a regular error response.
   */
  test("network failure (status 0) is reported without trying to parse a body", async () => {
    errorToThrow = new HttpErrorResponse({ status: 0, statusText: "Unknown Error", error: null });

    try {
      await client.get("");
      expect.fail("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AngularODataError);

      const error = e as AngularODataError;
      expect(error.status).toBe(0);
      expect(error.headers).toBeUndefined();
      expect(error.message).toMatch(/No response from server/);
      expect(error.cause).toBe(errorToThrow);
      expect(error.angularError).toBe(errorToThrow);
    }
  });

  test("custom error message retriever overrides the default OData extraction", async () => {
    errorToThrow = new HttpErrorResponse({ status: 400, error: { custom: "boom" } });
    client.setErrorMessageRetriever((body: any) => `custom: ${body.custom}`);

    await expect(client.get("")).rejects.toThrow("custom: boom");
  });

  test("blob operations (getBlob, createBlob, updateBlob) report failures the same way as get/post/put/patch/delete", async () => {
    errorToThrow = new HttpErrorResponse({ status: 404, error: { error: { message: "not found" } } });

    await expect(client.getBlob("")).rejects.toBeInstanceOf(AngularODataError);
    await expect(client.getBlob("")).rejects.toThrow("not found");
    await expect(client.updateBlob("", new Blob(["a"]), "image/jpg")).rejects.toBeInstanceOf(AngularODataError);
    await expect(client.createBlob("", new Blob(["a"]), "image/jpg")).rejects.toBeInstanceOf(AngularODataError);
  });
});
