// @vitest-environment jsdom

import { JQueryClient, JQueryClientError } from "@odata2ts/http-client-jquery";
import { ODataCollectionResponseV4, ODataModelResponseV4 } from "@odata2ts/odata-core";
import jquery from "jquery";
import { beforeAll, describe, expect, test } from "vitest";
import { BOOK_DER_PROZESS, booksUrl, bookUrl, DEFAULT_HEADERS, UNKNOWN_BOOK_ID } from "./constants.js";

describe("JQueryClient against a real server", () => {
  let CLIENT: JQueryClient;

  beforeAll(() => {
    expect(jquery, "JQuery not defined!").toBeDefined();
    expect(jquery.ajax, "JQuery's ajax module is not initialized!").toBeDefined();

    CLIENT = new JQueryClient(jquery, { headers: DEFAULT_HEADERS });
  });

  test("Simple Get", async () => {
    const response = await CLIENT.get<ODataModelResponseV4<any>>(bookUrl(BOOK_DER_PROZESS));

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/json");
    expect(response.data).toMatchObject({
      Id: BOOK_DER_PROZESS,
      Title: "Der Prozess",
      Language: "de",
      ISBN: "9783150094440",
      PageCount: 224,
    });
  });

  test("Get Collection", async () => {
    const response = await CLIENT.get<ODataCollectionResponseV4<any>>(booksUrl);

    expect(response.status).toBe(200);
    expect(response.data.value.length).toBeGreaterThan(0);
    expect(response.data.value.map((book: any) => book.Title)).toContain("Der Prozess");
  });

  test("404", async () => {
    try {
      await CLIENT.get(bookUrl(UNKNOWN_BOOK_ID));
      expect.unreachable("expected the request to fail with 404");
    } catch (e) {
      expect(e).toBeInstanceOf(JQueryClientError);
      const error = e as JQueryClientError;
      expect(error.status).toBe(404);
      expect(error.message).toMatch(/Not Found/);
    }
  });

  describe("Create, Manipulate and Delete Own Entity", () => {
    const model = {
      Title: "Das Schloss",
      Language: "de",
      PageCount: 352,
    };
    let id: string;

    test("POST", async () => {
      const response = await CLIENT.post<ODataModelResponseV4<any>>(booksUrl, model);

      expect(response.status).toBe(201);
      expect(response.data).toMatchObject(model);
      id = response.data.Id;
      expect(id).toBeDefined();
    });

    test("PATCH", async () => {
      // CAP answers PATCH with the full updated entity (200), not 204 No Content
      const response = await CLIENT.patch<ODataModelResponseV4<any>>(bookUrl(id), { PageCount: 353 });
      expect(response.status).toBe(200);
      expect(response.data.PageCount).toBe(353);

      const patched = await CLIENT.get<ODataModelResponseV4<any>>(bookUrl(id));
      expect(patched.data.PageCount).toBe(353);
      expect(patched.data.Title).toBe(model.Title);
    });

    test("DELETE", async () => {
      const response = await CLIENT.delete(bookUrl(id));
      expect(response.status).toBe(204);

      await expect(CLIENT.get(bookUrl(id))).rejects.toBeInstanceOf(JQueryClientError);
    });
  });
});
