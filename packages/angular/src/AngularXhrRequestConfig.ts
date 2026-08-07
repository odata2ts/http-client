import { HttpContext } from "@angular/common/http";
import { ODataRequestConfig } from "@odata2ts/http-client-api";

export interface AngularXhrRequestConfig extends ODataRequestConfig {
  context?: HttpContext;
  reportProgress?: boolean;
  withCredentials?: boolean;
  credentials?: RequestCredentials;
  keepalive?: boolean;
  priority?: RequestPriority;
  cache?: RequestCache;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  referrer?: string;
  integrity?: string;
  transferCache?:
    | {
        includeHeaders?: string[];
      }
    | boolean;
  timeout?: number;
}
