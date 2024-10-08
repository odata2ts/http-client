import { ODataCollectionResponseV4, ODataModelResponseV4 } from "@odata2ts/odata-core";
import { describe, expect, test } from "vitest";
import { AxiosClient, AxiosClientError } from "../src";

describe("HTTP Communication Tests", function () {
  const BASE_URL = "https://services.odata.org/TripPinRESTierService/(S(xxxsujx4iqjss1vkeighyks6))";
  const DEFAULT_HEADERS = { Accept: "application/json", "Content-Type": "application/json" };

  let REAL_CLIENT = new AxiosClient({ headers: DEFAULT_HEADERS });

  test("download", async () => {});

  test("Simple Get", async () => {
    const url = BASE_URL + "/People('russellwhyte')";
    const response = await REAL_CLIENT.get<ODataCollectionResponseV4<any>>(url);
    const { date, ...headers } = response.headers;
    expect(response).toMatchObject({
      status: 200,
      statusText: "OK",
    });
    expect(headers).toMatchObject({
      "content-length": "445",
      "content-type": "application/json; odata.metadata=minimal",
      "cache-control": "no-cache",
      // "content-encoding": "gzip",
      expires: "-1",
      pragma: "no-cache",
      "odata-version": "4.0",
      server: "Microsoft-IIS/10.0",
      vary: "Accept-Encoding",
    });
    expect(response.data).toMatchObject({
      FirstName: "Russell",
      LastName: "Whyte",
      Emails: ["Russell@example.com", "Russell@contoso.com"],
    });
  });

  test("404", async () => {
    const expectedErrorMsg = "The request resource is not found.";
    const url = BASE_URL + "/People('NON_EXISTING')";
    try {
      await REAL_CLIENT.get<ODataCollectionResponseV4<any>>(url);
    } catch (e) {
      expect(e).toBeInstanceOf(AxiosClientError);

      const error = e as AxiosClientError;
      expect(error).toMatchObject({
        name: "AxiosClientError",
        status: 404,
        message: `OData server responded with error: ${expectedErrorMsg}`,
      });
      expect(error.cause?.message).toContain(expectedErrorMsg);
      expect(error.stack).toMatch(expectedErrorMsg);
      expect(error.stack).toMatch(error.name);
    }
  });

  const entitySetUrl = BASE_URL + "/People";
  const id = "heineritis";
  const entityUrl = `${entitySetUrl}('${id}')`;
  const model = {
    UserName: id,
    FirstName: "Heiner",
    LastName: "Itis",
  };

  describe("Create Own Entity", function () {
    test("POST", async () => {
      // delete the entity we want to create => required if any test failed
      try {
        await REAL_CLIENT.delete(entityUrl);
      } catch (e) {
        //ignore
      }

      let response = await REAL_CLIENT.post<ODataModelResponseV4<any>>(entitySetUrl, model);

      expect(response).toMatchObject({
        status: 201,
        statusText: "Created",
        headers: {
          "cache-control": "no-cache",
          "content-type": "application/json; odata.metadata=minimal",
          location: entityUrl,
        },
      });
      expect(response.data).toMatchObject(model);
    });
  });

  describe("Manipulate Own Entity", function () {
    test("PUT", async () => {
      const newModel = {
        FirstName: "Horst",
        Age: 34,
      };
      let response = await REAL_CLIENT.put<void>(entityUrl, newModel);
      expect(response).toMatchObject({
        status: 204,
        statusText: "No Content",
        data: "",
      });

      response = await REAL_CLIENT.get(entityUrl);
      expect(response.data).toMatchObject(newModel);
    });

    test("PATCH", async () => {
      const response = await REAL_CLIENT.patch<void>(entityUrl, {
        MiddleName: "kk",
      });
      expect(response).toMatchObject({
        status: 204,
        statusText: "No Content",
        data: "",
      });

      const response2 = await REAL_CLIENT.get<ODataModelResponseV4<any>>(entityUrl);
      expect(response2.data.MiddleName).toBe("kk");
    });
  });

  describe("Delete Own Entity", function () {
    test("DELETE", async () => {
      const response = await REAL_CLIENT.delete(entityUrl);
      expect(response).toMatchObject({
        status: 204,
        statusText: "No Content",
        data: "",
      });
    });
  });
});
