import { ODataRequestConfig } from "@odata2ts/http-client-api";
import { AxiosRequestConfig as OriginalRequestConfig } from "axios";

export interface AxiosRequestConfig
  extends ODataRequestConfig, Omit<OriginalRequestConfig, "method" | "url" | "headers" | "params"> {}

export function mergeConfig(): undefined;
export function mergeConfig(...configs: Array<AxiosRequestConfig | undefined>): AxiosRequestConfig;
export function mergeConfig(...configs: Array<AxiosRequestConfig | undefined>) {
  if (!configs.length) {
    return undefined;
  }

  return configs
    .filter((c): c is AxiosRequestConfig => !!c)
    .reduce<AxiosRequestConfig>(
      (collector, current) => {
        const { headers, ...passThrough } = current;

        if (headers) {
          Object.entries(headers).forEach(([key, val]) => (collector.headers![key] = val));
        }
        return { ...collector, ...passThrough };
      },
      { headers: {} },
    );
}
