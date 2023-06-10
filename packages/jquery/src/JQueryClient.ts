/// <reference path="../../../node_modules/@types/jquery/JQueryStatic.d.ts" />

import { HttpResponseModel } from "@odata2ts/http-client-api";
import { BaseHttpClient, BaseHttpClientOptions, HttpMethods } from "@odata2ts/http-client-base";

import { AjaxRequestConfig, getDefaultConfig, mergeAjaxConfig } from "./AjaxRequestConfig";
import { JQueryClientError } from "./JQueryClientError";

import jqXHR = JQuery.jqXHR;

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
    return mergeAjaxConfig(config, { headers });
  }

  protected executeRequest<ResponseModel>(
    method: HttpMethods,
    url: string,
    data: any,
    requestConfig?: JQuery.AjaxSettings
  ): Promise<HttpResponseModel<ResponseModel>> {
    const mergedConfig = mergeAjaxConfig(this.config, requestConfig);
    mergedConfig.method = method;
    mergedConfig.url = url;
    mergedConfig.data = JSON.stringify(data);

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
          const responseMessage = this.retrieveErrorMessage(jqXHR.responseJSON);
          const errorMessage = responseMessage
            ? "Server responded with error: " + responseMessage
            : textStatus + " " + thrownError;
          const responseHeaders = this.mapHeaders(jqXHR);
          reject(new JQueryClientError(errorMessage, jqXHR.status, responseHeaders, new Error(thrownError), jqXHR));
        },
      });
    });
  }
}
