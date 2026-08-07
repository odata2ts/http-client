// required so @angular/common/http's own Ivy-decorated classes (e.g. HttpClient) can be loaded outside of
// an Angular CLI build, which normally runs the Angular Linker over node_modules as well: without either
// that or this JIT fallback, merely importing them throws "needs to be compiled using the JIT compiler".
import "@angular/compiler";

import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { ODataHttpMethods } from "@odata2ts/http-client-api";
import { of } from "rxjs";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AngularXhrClient } from "../src/index.js";

const DEFAULT_URL = "TEST/hi";
const SUCCESS_BODY = { Name: "Test" };
const JSON_VALUE = "application/json";
const DEFAULT_GET_HEADERS = { Accept: JSON_VALUE };
const DEFAULT_EDIT_HEADERS = { ...DEFAULT_GET_HEADERS, "Content-Type": JSON_VALUE };

interface RecordedCall {
  method: string;
  url: string;
  options: any;
}

function headersToObject(headers: HttpHeaders): Record<string, string> {
  return headers.keys().reduce<Record<string, string>>((collector, key) => {
    collector[key] = headers.get(key)!;
    return collector;
  }, {});
}

function paramsToObject(params: HttpParams): Record<string, string | Array<string>> {
  return params.keys().reduce<Record<string, string | Array<string>>>((collector, key) => {
    const values = params.getAll(key)!;
    collector[key] = values.length > 1 ? values : values[0];
    return collector;
  }, {});
}

describe("AngularXhrClient Tests", () => {
  let client: AngularXhrClient;
  let requestMock: ReturnType<typeof vi.fn>;
  let getMock: ReturnType<typeof vi.fn>;
  let lastCall: RecordedCall | undefined;
  let responseStatus: number;
  let responseBody: any;
  let responseHeaders: HttpHeaders;

  beforeEach(() => {
    lastCall = undefined;
    responseStatus = 200;
    responseBody = SUCCESS_BODY;
    responseHeaders = new HttpHeaders({ "content-type": "application/json" });

    requestMock = vi.fn((method: string, url: string, options: any) => {
      lastCall = { method, url, options };
      return of(new HttpResponse({ status: responseStatus, statusText: "OK", body: responseBody, headers: responseHeaders }));
    });
    getMock = vi.fn((url: string, options: any) => {
      lastCall = { method: "GET", url, options };
      return of(new HttpResponse({ status: responseStatus, statusText: "OK", body: responseBody, headers: responseHeaders }));
    });

    const httpClientMock = { request: requestMock, get: getMock } as unknown as HttpClient;
    client = new AngularXhrClient(httpClientMock);
  });

  test("get request", async () => {
    const response = await client.get(DEFAULT_URL);

    expect(requestMock).toHaveBeenCalledOnce();
    expect(lastCall?.method).toBe("GET");
    expect(lastCall?.url).toBe(DEFAULT_URL);
    expect(lastCall?.options).toMatchObject({ observe: "response", responseType: "json", body: undefined });
    expect(headersToObject(lastCall!.options.headers)).toStrictEqual(DEFAULT_GET_HEADERS);
    expect(paramsToObject(lastCall!.options.params)).toStrictEqual({});
    expect(response).toStrictEqual({
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
      data: SUCCESS_BODY,
    });
  });

  test("post request", async () => {
    const data = { a: 1 };
    await client.post(DEFAULT_URL, data);

    expect(lastCall?.method).toBe("POST");
    expect(lastCall?.url).toBe(DEFAULT_URL);
    expect(lastCall?.options.body).toStrictEqual(data);
    expect(headersToObject(lastCall!.options.headers)).toStrictEqual(DEFAULT_EDIT_HEADERS);
  });

  test("put request", async () => {
    const data = { a: 1 };
    await client.put(DEFAULT_URL, data);

    expect(lastCall?.method).toBe("PUT");
    expect(lastCall?.options.body).toStrictEqual(data);
    expect(headersToObject(lastCall!.options.headers)).toStrictEqual(DEFAULT_EDIT_HEADERS);
  });

  test("patch request", async () => {
    const data = { a: 1 };
    await client.patch(DEFAULT_URL, data);

    expect(lastCall?.method).toBe("PATCH");
    expect(lastCall?.options.body).toStrictEqual(data);
    expect(headersToObject(lastCall!.options.headers)).toStrictEqual(DEFAULT_EDIT_HEADERS);
  });

  test("delete request", async () => {
    await client.delete(DEFAULT_URL);

    expect(lastCall?.method).toBe("DELETE");
    expect(lastCall?.options.body).toBeUndefined();
    expect(headersToObject(lastCall!.options.headers)).toStrictEqual(DEFAULT_GET_HEADERS);
  });

  test("generic request via method enum defaults like the matching convenience method", async () => {
    await client.request(DEFAULT_URL, ODataHttpMethods.Get, undefined);
    expect(lastCall?.method).toBe("GET");
    expect(headersToObject(lastCall!.options.headers)).toStrictEqual(DEFAULT_GET_HEADERS);

    await client.request(DEFAULT_URL, ODataHttpMethods.Post, {});
    expect(lastCall?.method).toBe("POST");
    expect(headersToObject(lastCall!.options.headers)).toStrictEqual(DEFAULT_EDIT_HEADERS);
  });

  test("using additional headers", async () => {
    await client.get(DEFAULT_URL, undefined, { hey: "Ho" });

    expect(headersToObject(lastCall!.options.headers)).toStrictEqual({ ...DEFAULT_GET_HEADERS, hey: "Ho" });
  });

  /**
   * requestConfig.headers is the most specific source (it travels with the individual request's own
   * configuration), so it wins over additionalHeaders, which in turn wins over the JSON defaults - the
   * same precedence AxiosClient, FetchClient and JQueryClient use.
   */
  test("requestConfig headers win over additional headers, which win over the defaults", async () => {
    await client.get(
      DEFAULT_URL,
      { headers: { Accept: "requestConfig-wins", Shared: "config" } },
      { Shared: "additional", "X-B": "2" },
    );

    expect(headersToObject(lastCall!.options.headers)).toStrictEqual({
      Accept: "requestConfig-wins",
      Shared: "config",
      "X-B": "2",
    });
  });

  test("using params in request config", async () => {
    await client.get(DEFAULT_URL, { params: { top: 10, active: true, select: ["Name", "Age"] } });

    expect(paramsToObject(lastCall!.options.params)).toStrictEqual({
      top: "10",
      active: "true",
      select: ["Name", "Age"],
    });
  });

  test("simulate 204 no content", async () => {
    responseStatus = 204;
    responseBody = null;

    const response = await client.post(DEFAULT_URL, {});

    expect(response.status).toBe(204);
    expect(response.data).toBeNull();
  });

  describe("binary data", () => {
    test("get blob request sends no default Accept header, since the response is not JSON", async () => {
      const blob = new Blob(["a"]);
      responseBody = blob;

      const response = await client.getBlob(DEFAULT_URL);

      expect(getMock).toHaveBeenCalledOnce();
      expect(requestMock).not.toHaveBeenCalled();
      expect(lastCall?.url).toBe(DEFAULT_URL);
      expect(lastCall?.options).toMatchObject({ observe: "response", responseType: "blob" });
      expect(headersToObject(lastCall!.options.headers)).toStrictEqual({});
      expect(response.data).toBe(blob);
    });

    test("create blob request", async () => {
      const blob = new Blob(["a"]);
      const mimeType = "image/jpg";

      await client.createBlob(DEFAULT_URL, blob, mimeType);

      expect(requestMock).toHaveBeenCalledOnce();
      expect(lastCall?.method).toBe("POST");
      expect(lastCall?.options.body).toBe(blob);
      expect(lastCall?.options.responseType).toBe("blob");
      expect(headersToObject(lastCall!.options.headers)).toStrictEqual({ Accept: JSON_VALUE, "Content-Type": mimeType });
    });

    test("update blob request", async () => {
      const blob = new Blob(["a"]);
      const mimeType = "image/jpg";

      await client.updateBlob(DEFAULT_URL, blob, mimeType);

      expect(lastCall?.method).toBe("PUT");
      expect(headersToObject(lastCall!.options.headers)).toStrictEqual({ Accept: JSON_VALUE, "Content-Type": mimeType });
    });

    test("caller headers are combined with the mime type for blob uploads, but the mime type always wins the content type", async () => {
      const blob = new Blob(["a"]);

      await client.createBlob(
        DEFAULT_URL,
        blob,
        "image/jpg",
        { headers: { "X-A": "1", "Content-Type": "should-be-overruled" } },
        { "X-B": "2" },
      );

      expect(headersToObject(lastCall!.options.headers)).toStrictEqual({
        Accept: JSON_VALUE,
        "X-A": "1",
        "X-B": "2",
        "Content-Type": "image/jpg",
      });
    });
  });

  describe("stream methods are unsupported", () => {
    test("getStream rejects", async () => {
      await expect(client.getStream()).rejects.toThrow(/does not support ReadableStream responses/);
    });

    test("createStream rejects", async () => {
      await expect(client.createStream()).rejects.toThrow(/does not support ReadableStream uploads/);
    });

    test("updateStream rejects", async () => {
      await expect(client.updateStream()).rejects.toThrow(/does not support ReadableStream uploads/);
    });
  });
});
