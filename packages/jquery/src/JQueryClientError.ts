/// <reference path="../../../node_modules/@types/jquery/misc.d.ts" />

import { ODataClientError } from "@odata2ts/http-client-api";

export class JQueryClientError extends Error implements ODataClientError {
  constructor(
    msg: string,
    public readonly status: number | undefined,
    public readonly headers: Record<string, string> | undefined,
    public readonly cause: Error | undefined,
    public readonly jqXHR: JQuery.jqXHR
  ) {
    // @ts-ignore: fetch requires lib "dom" or "webworker", but then the "cause" property becomes unknown to TS
    super(msg, { cause });
    this.name = this.constructor.name;
  }
}
