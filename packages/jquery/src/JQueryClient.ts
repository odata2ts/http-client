/// <reference path="../../../node_modules/@types/jquery/JQueryStatic.d.ts" />

import { HttpResponseModel } from "@odata2ts/http-client-api";
import {
  BaseHttpClient,
  BaseHttpClientOptions,
  HttpMethods,
  InternalBaseHttpClientOptions,
} from "@odata2ts/http-client-base";

import { AjaxRequestConfig, getDefaultConfig, mergeAjaxConfig } from "./AjaxRequestConfig";
import { JQueryClientError } from "./JQueryClientError";

import jqXHR = JQuery.jqXHR;

export const DEFAULT_ERROR_MESSAGE = "No error message!";

export interface ClientOptions extends BaseHttpClientOptions {}

export class JQueryClient extends BaseHttpClient<AjaxRequestConfig> {
  private readonly client: JQueryStatic;
  private readonly config: JQuery.AjaxSettings;

  constructor(jquery: JQueryStatic, config?: AjaxRequestConfig, private clientOptions?: ClientOptions) {
    super(clientOptions);
    this.client = jquery;
    this.config = getDefaultConfig(config);
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

  protected addHeaderToRequestConfig(headers: Record<string, string>, config?: AjaxRequestConfig): AjaxRequestConfig {
    return mergeAjaxConfig({ headers }, config);
  }

  protected async executeRequest<ResponseModel>(
    method: HttpMethods,
    url: string,
    data: any,
    internalOptions: InternalBaseHttpClientOptions,
    requestConfig?: JQuery.AjaxSettings
  ): Promise<HttpResponseModel<ResponseModel>> {
    const { params, ...mergedConfig } = mergeAjaxConfig(this.config, requestConfig);
    mergedConfig.method = method;
    mergedConfig.data = JSON.stringify(data);
    mergedConfig.url = url;
    if (params && Object.values(params).length) {
      mergedConfig.url +=
        (url.match(/\?/) ? "&" : "?") +
        // @ts-ignore
        new URLSearchParams(params).toString();
    }

    if (internalOptions.dataType === "blob") {
      mergedConfig.xhrFields = { responseType: "blob" };
    } else if (internalOptions.dataType === "stream") {
      throw new Error("Streaming is not supported by the JqueryClient!");
    }

    // the actual request
    return new Promise((resolve, reject) => {
      this.client.ajax({
        ...mergedConfig,
        success: (response: any, textStatus: string, jqXHR: JQuery.jqXHR) => {
          resolve({
            status: jqXHR.status,
            statusText: jqXHR.statusText,
            headers: this.mapHeaders(jqXHR),
            data: response,
          });
        },
        error: (jqXHR: JQuery.jqXHR, textStatus: string, thrownError: string) => {
          const responseMessage = this.retrieveErrorMessage(jqXHR?.responseJSON);
          const failMsg = responseMessage || thrownError || DEFAULT_ERROR_MESSAGE;
          const errorMessage = responseMessage ? "OData server responded with error: " + responseMessage : failMsg;
          const responseHeaders = this.mapHeaders(jqXHR);
          reject(new JQueryClientError(errorMessage, jqXHR.status, responseHeaders, new Error(failMsg), jqXHR));
        },
      });
    });
  }
}
