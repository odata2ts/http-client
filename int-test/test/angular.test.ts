// @vitest-environment jsdom

// required so @angular/common/http's own Ivy-decorated classes (e.g. HttpClient) can be loaded outside of
// an Angular CLI build - see packages/angular/test/AngularXhrODataClient.test.ts for the same import.
import "@angular/compiler";
import { provideHttpClient } from "@angular/common/http";
import { provideZonelessChangeDetection } from "@angular/core";
import { getTestBed, TestBed } from "@angular/core/testing";
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from "@angular/platform-browser-dynamic/testing";
import { AngularXhrClient, AngularXhrError } from "@odata2ts/http-client-angular";
import { ODataCollectionResponseV4, ODataModelResponseV4 } from "@odata2ts/odata-core";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { BOOK_DER_PROZESS, booksUrl, bookUrl, UNKNOWN_BOOK_ID } from "./constants.js";

/**
 * Unlike the other three clients, `AngularXhrClient` is not constructed directly - it is provided by
 * Angular's DI container (`@Injectable({ providedIn: "root" })`), and `provideHttpClient()` defaults to
 * the XHR-based backend (as opposed to `withFetch()`). Running under `jsdom` gives it a real
 * `XMLHttpRequest` to drive, so this is the one test in the suite that actually exercises the XHR code
 * path the class is built around, rather than a `HttpClient` mock like packages/angular/test does.
 */
describe("AngularXhrClient against a real server", () => {
  let CLIENT: AngularXhrClient;

  // TestBed needs an initialized platform before `configureTestingModule` can resolve a compiler, even
  // though nothing here ever renders a component - it's the minimal setup Angular's own CLI-generated
  // `test.ts` does, reproduced by hand since this is Vitest rather than Karma/Jest.
  beforeAll(() => {
    getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      // no zone.js in this suite - real awaited HTTP calls don't need change-detection scheduling
      providers: [provideZonelessChangeDetection(), provideHttpClient()],
    });
    CLIENT = TestBed.inject(AngularXhrClient);
  });

  // each test injects AngularXhrClient, which instantiates the testing module - it must be torn down
  // before the next `configureTestingModule` call is allowed
  afterEach(() => {
    TestBed.resetTestingModule();
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
    await expect(CLIENT.get(bookUrl(UNKNOWN_BOOK_ID))).rejects.toMatchObject({
      name: "AngularXhrError",
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

      await expect(CLIENT.get(bookUrl(id))).rejects.toBeInstanceOf(AngularXhrError);
    });
  });
});
