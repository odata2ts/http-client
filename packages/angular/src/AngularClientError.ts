import { HttpErrorResponse } from "@angular/common/http";
import { ODataClientError } from "@odata2ts/http-client-api";

export class AngularXhrError extends Error implements ODataClientError {
  constructor(
    msg: string,
    public readonly status?: number,
    public readonly headers?: Record<string, string>,
    public readonly cause?: Error,
    public readonly angularError?: HttpErrorResponse,
  ) {
    // @ts-ignore: fetch requires lib "dom" or "webworker", but then the "cause" property becomes unknown to TS
    super(msg, { cause });
    this.name = this.constructor.name;
  }
}
