/// <reference path="../../../node_modules/@types/jquery/JQueryStatic.d.ts" />

import {
  HttpResponseModel,
  ODataHttpClient,
  ODataHttpClientOptions,
  ODataHttpMethods,
} from "@odata2ts/http-client-api";
import { BaseHttpClient, BaseRequestConfig, parseErrorResponseBody } from "@odata2ts/http-client-base";
import { DEFAULT_ERROR_MESSAGE, FAILURE_RESPONSE_MESSAGE } from "@odata2ts/http-client-common";
import { JQueryClientError } from "./JQueryClientError";
import { JQueryRequestConfig, mergeConfigs } from "./JQueryRequestConfig";

import jqXHR = JQuery.jqXHR;

export { DEFAULT_ERROR_MESSAGE } from "@odata2ts/http-client-common";
export const FAILURE_STREAM_UNSUPPORTED =
  "Streaming is not supported by the JqueryClient! XmlHttpRequest, which jQuery's ajax method builds " +
  "upon, has no streaming API at all - neither for reading a response nor for sending a request body. " +
  "Use the FetchClient for streams.";

interface InternalRequestConfig
  extends
    JQueryRequestConfig,
    Pick<JQuery.AjaxSettings, "url" | "data" | "dataType" | "method" | "xhrFields" | "processData" | "contentType"> {}

export class JQueryClient extends BaseHttpClient<JQueryRequestConfig> implements ODataHttpClient<JQueryRequestConfig> {
  private readonly client: JQueryStatic;
  private readonly config: JQueryRequestConfig;

  constructor(jquery: JQueryStatic, config?: JQueryRequestConfig, clientOptions?: ODataHttpClientOptions) {
    super(clientOptions);
    this.client = jquery;
    this.config = config ?? {};
  }

  protected mapHeaders(jqXhr: jqXHR): Record<string, string> {
    return jqXhr
      .getAllResponseHeaders()
      .trim()
      .split(/[\r\n]+/)
      .reduce((collector: Record<string, string>, line: string) => {
        const parts = line.split(": ");
        const header = parts.shift();
        const value = parts.join(": ");

        if (header) {
          collector[header.toLowerCase()] = value;
        }
        return collector;
      }, {});
  }

  /**
   * Turns a failed request into the error to reject with.
   *
   * `responseJSON` is jQuery's own parsing of the response and covers the ordinary case. It stays empty
   * for a binary request though: with `responseType: "blob"` XmlHttpRequest offers neither `responseText`
   * nor anything jQuery could have parsed, and the server's error document sits in `response` as binary.
   * Reading it there is what keeps a failing `getBlob` from reporting the default message.
   */
  private async buildFailure(jqXHR: jqXHR, thrownError: string): Promise<JQueryClientError> {
    let responseData: unknown;
    try {
      // `response` belongs to XmlHttpRequest itself, which jQuery's typing does not carry over
      const rawResponse = (jqXHR as unknown as Partial<XMLHttpRequest> | undefined)?.response;
      responseData = jqXHR?.responseJSON ?? (await parseErrorResponseBody(rawResponse));
    } catch (e) {
      responseData = undefined;
    }

    const responseMessage = this.retrieveErrorMessage(responseData);
    const failMsg = responseMessage || thrownError || DEFAULT_ERROR_MESSAGE;
    const errorMessage = responseMessage ? FAILURE_RESPONSE_MESSAGE + responseMessage : failMsg;

    return new JQueryClientError(errorMessage, jqXHR.status, this.mapHeaders(jqXHR), new Error(failMsg), jqXHR);
  }

  protected async executeRequest<ResponseModel>(
    method: ODataHttpMethods,
    url: string,
    data: any,
    requestConfig: JQueryRequestConfig | undefined,
    internalConfig: BaseRequestConfig,
  ): Promise<HttpResponseModel<ResponseModel>> {
    const { headers } = internalConfig;
    const { params, ...mergedConfig } = mergeConfigs(this.config, mergeConfigs({ headers }, requestConfig));
    const isBinary = internalConfig.dataType === "blob";

    // set core inputs for request
    const resultConfig: InternalRequestConfig = {
      ...mergedConfig,
      method,
      // only binary data and an explicitly plain text body are passed through as they are
      data: isBinary || this.isPlainTextBody(internalConfig.headers) ? data : JSON.stringify(data),
      url,
    };

    // apply additional query params to the URL
    if (params && Object.values(params).length) {
      resultConfig.url +=
        (url.match(/\?/) ? "&" : "?") +
        // @ts-ignore
        new URLSearchParams(params).toString();
    }

    // handling of extra data types: blob and stream (not supported)
    if (isBinary) {
      resultConfig.xhrFields = { responseType: "blob" };
      // jQuery would otherwise turn the blob into a query string (processData defaults to true)
      // and add its own urlencoded content type; the actual mime type is already part of the headers
      resultConfig.processData = false;
      resultConfig.contentType = false;
    } else if (internalConfig.dataType === "stream") {
      // a refusal is a failure of this client like any other, hence it carries the same error type
      throw new JQueryClientError(FAILURE_STREAM_UNSUPPORTED);
    }

    // the actual request
    return new Promise((resolve, reject) => {
      this.client.ajax({
        ...resultConfig,
        success: (response: any, textStatus: string, jqXHR: JQuery.jqXHR) => {
          resolve({
            status: jqXHR.status,
            statusText: jqXHR.statusText,
            headers: this.mapHeaders(jqXHR),
            data: response,
          });
        },
        error: (jqXHR: JQuery.jqXHR, textStatus: string, thrownError: string) => {
          // decoding the error document may take a turn of the event loop, hence the detour
          this.buildFailure(jqXHR, thrownError).then(reject, reject);
        },
      });
    });
  }
}
