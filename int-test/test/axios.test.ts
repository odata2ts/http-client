import { AxiosClient, AxiosClientError } from "@odata2ts/http-client-axios";
import { ODataCollectionResponseV4, ODataModelResponseV4 } from "@odata2ts/odata-core";
import { describe, expect, test } from "vitest";
import { batchUrl, BOOK_DER_PROZESS, booksUrl, bookUrl, DEFAULT_HEADERS, UNKNOWN_BOOK_ID } from "./constants.js";

describe("AxiosClient against a real server", () => {
  const CLIENT = new AxiosClient({ headers: DEFAULT_HEADERS });

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
      name: "AxiosClientError",
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
      expect(patched.data.Title).toBe(model.Title);
    });

    test("DELETE", async () => {
      const response = await CLIENT.delete(bookUrl(id));
      expect(response.status).toBe(204);
      expect(response.statusText).toBe("No Content");

      await expect(CLIENT.get(bookUrl(id))).rejects.toBeInstanceOf(AxiosClientError);
    });
  });

  describe("Batch requests", () => {
    test("multipart batch (default format): GET + POST, correlated by Content-ID", async () => {
      const response = await CLIENT.batch(batchUrl, {
        requests: [
          { id: "1", method: "get", url: `Books(${BOOK_DER_PROZESS})` },
          {
            id: "2",
            method: "post",
            url: "Books",
            body: { Title: "Multipart Batch Book", Language: "de", PageCount: 111 },
          },
        ],
      });

      expect(response.status).toBe(200);
      expect(response.data.resolvedBy).toBe("id");
      const [getResponse, postResponse] = response.data.responses;
      expect(getResponse).toMatchObject({ id: "1", status: 200 });
      expect(getResponse.body).toMatchObject({ Title: "Der Prozess" });
      expect(postResponse.status).toBe(201);

      const createdId = (postResponse.body as { Id: string }).Id;
      expect(createdId).toBeDefined();
      await CLIENT.delete(bookUrl(createdId));
    });

    test('JSON batch: same shape, format: "json"', async () => {
      const response = await CLIENT.batch(
        batchUrl,
        {
          requests: [
            { id: "1", method: "get", url: `Books(${BOOK_DER_PROZESS})` },
            {
              id: "2",
              method: "post",
              url: "Books",
              body: { Title: "JSON Batch Book", Language: "de", PageCount: 222 },
            },
          ],
        },
        { format: "json" },
      );

      expect(response.status).toBe(200);
      expect(response.data.resolvedBy).toBe("id");
      const [getResponse, postResponse] = response.data.responses;
      expect(getResponse).toMatchObject({ id: "1", status: 200 });
      expect(getResponse.body).toMatchObject({ Title: "Der Prozess" });
      expect(postResponse.status).toBe(201);

      const createdId = (postResponse.body as { Id: string }).Id;
      expect(createdId).toBeDefined();
      await CLIENT.delete(bookUrl(createdId));
    });

    test("multipart batch: an atomicity group creates two books as one change set", async () => {
      const response = await CLIENT.batch(batchUrl, {
        requests: [
          {
            id: "1",
            method: "post",
            url: "Books",
            atomicityGroup: "g1",
            body: { Title: "Change Set Book A", Language: "de", PageCount: 100 },
          },
          {
            id: "2",
            method: "post",
            url: "Books",
            atomicityGroup: "g1",
            body: { Title: "Change Set Book B", Language: "de", PageCount: 200 },
          },
        ],
      });

      expect(response.data.resolvedBy).toBe("id");
      expect(response.data.responses).toHaveLength(2);
      for (const r of response.data.responses) {
        expect(r.status).toBe(201);
        expect(r.atomicityGroup).toBe("g1");
      }

      const [bookA, bookB] = response.data.responses;
      await CLIENT.delete(bookUrl((bookA.body as { Id: string }).Id));
      await CLIENT.delete(bookUrl((bookB.body as { Id: string }).Id));
    });
  });
});
