import { ODataRequestConfig } from "@odata2ts/http-client-api";

const DEFAULT_CONFIG: FetchRequestConfig = {
  cache: "no-store",
};

/**
 * Available config options for end user when making a given request.
 */
export interface FetchRequestConfig
  extends
    ODataRequestConfig,
    Partial<Pick<RequestInit, "credentials" | "cache" | "mode" | "redirect" | "referrerPolicy" | "signal">> {}

export function getDefaultConfig(config?: FetchRequestConfig): FetchRequestConfig {
  return mergeFetchConfig(DEFAULT_CONFIG, config);
}

export function mergeFetchConfig(): undefined;
export function mergeFetchConfig(...configs: Array<FetchRequestConfig | undefined>): FetchRequestConfig;
export function mergeFetchConfig(...configs: Array<FetchRequestConfig | undefined>) {
  if (!configs.length) {
    return undefined;
  }
  return configs
    .filter((c): c is FetchRequestConfig => !!c)
    .reduce<FetchRequestConfig>(
      (collector, current) => {
        const { headers: prevHeaders, ...prevPassThrough } = collector;
        const { headers, ...passThrough } = current;

        if (headers) {
          Object.entries(cleanHeaders(headers)).forEach(([key, val]) => (collector.headers![key] = val));
        }

        return { ...collector, ...passThrough };
      },
      { headers: {} },
    );
}

function cleanHeaders(headers: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  const temp = new Headers();
  Object.entries(headers).forEach(([key, val]) => temp.set(key, val));
  temp.forEach((val, key) => (result[key] = val));

  return result;
}
