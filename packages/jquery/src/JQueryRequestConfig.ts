import { ODataRequestConfig } from "@odata2ts/http-client-api";

export interface JQueryRequestConfig
  extends
    ODataRequestConfig,
    Pick<JQuery.AjaxSettings, "complete" | "beforeSend" | "statusCode" | "timeout" | "cache"> {}

export function mergeConfigs(config?: JQueryRequestConfig, toMerge?: JQueryRequestConfig): JQueryRequestConfig {
  const { headers, ...passThrough } = config || {};
  const { headers: headers2, ...passThrough2 } = toMerge || {};
  return {
    ...passThrough,
    ...passThrough2,
    headers: {
      ...headers,
      ...headers2,
    },
  };
}
