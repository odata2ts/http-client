const DEFAULT_CONFIG: JQuery.AjaxSettings = {
  // we never want caching
  cache: false,
  // we always want JSON
  // dataType: "json",
};

/**
 * Available config options for end user when making a given request.
 */
export interface AjaxRequestConfig
  extends Pick<JQuery.AjaxSettings, "complete" | "beforeSend" | "headers" | "statusCode" | "timeout"> {
  /**
   * Add query params.
   */
  params?: Record<string, string | number | boolean | Array<string | number | boolean>>;
}

export interface InternalRequestConfig extends JQuery.AjaxSettings, Pick<AjaxRequestConfig, "params"> {}

export function getDefaultConfig(config?: AjaxRequestConfig): InternalRequestConfig {
  return mergeAjaxConfig(DEFAULT_CONFIG, config);
}

export function mergeAjaxConfig(config?: JQuery.AjaxSettings, toMerge?: JQuery.AjaxSettings): InternalRequestConfig {
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
