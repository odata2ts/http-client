import { ODataCollectionResponseV4, ODataModelResponseV4 } from "@odata2ts/odata-core";
import { FetchClient, FetchClientError } from "@odata2ts/http-client-fetch";
import { describe, expect, test } from "vitest";
import { BOOK_DER_PROZESS, DEFAULT_HEADERS, UNKNOWN_BOOK_ID, bookUrl, booksUrl } from "./constants.js";

describe("FetchClient against a real server", () => {
  const CLIENT = new FetchClient({ headers: DEFAULT_HEADERS });

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
    await expect(CLIENT.get(bookUrl(UNKNOWN_BOOK_ID))).rejects.toMatchObject({
      name: "FetchClientError",
      status: 404,
      message: expect.stringMatching(/Not Found/),
    });
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
      // untouched properties survive a patch
      expect(patched.data.Title).toBe(model.Title);
    });

    test("DELETE", async () => {
      const response = await CLIENT.delete(bookUrl(id));
      expect(response).toMatchObject({ status: 204, statusText: "No Content", data: undefined });

      await expect(CLIENT.get(bookUrl(id))).rejects.toBeInstanceOf(FetchClientError);
    });
  });
});
