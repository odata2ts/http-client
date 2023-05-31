import { CreateAxiosDefaults, AxiosRequestConfig as OriginalRequestConfig } from "axios";

export interface AxiosRequestConfig extends Omit<OriginalRequestConfig, "method" | "url" | "headers"> {
  headers?: Record<string, string>;
}

export interface InternalRequestConfig extends Omit<OriginalRequestConfig, "headers"> {
  url?: string;
  headers?: Record<string, string>;
}

const DEFAULT_CONFIG: InternalRequestConfig = {
  headers: { Accept: "application/json", "Content-Type": "application/json" },
};

export function getDefaultConfig(config?: AxiosRequestConfig | undefined): CreateAxiosDefaults {
  return mergeConfig(DEFAULT_CONFIG, config as InternalRequestConfig) as CreateAxiosDefaults;
}

export function mergeConfig(): undefined;
export function mergeConfig(...configs: Array<InternalRequestConfig | undefined>): InternalRequestConfig;
export function mergeConfig(...configs: Array<InternalRequestConfig | undefined>) {
  if (!configs.length) {
    return undefined;
  }

  return configs
    .filter((c): c is InternalRequestConfig => !!c)
    .reduce<InternalRequestConfig>(
      (collector, current) => {
        const { headers, ...passThrough } = current;

        if (headers) {
          Object.entries(headers).forEach(([key, val]) => (collector.headers![key] = val));
        }
        return { ...collector, ...passThrough };
      },
      { headers: {} }
    );
}
