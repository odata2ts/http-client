import { ODataClientError } from "@odata2ts/http-client-api";
import type { AxiosError } from "axios";

export class AxiosClientError extends Error implements ODataClientError {
  constructor(
    msg: string,
    public readonly status?: number,
    public readonly headers?: Record<string, string>,
    public readonly cause?: Error,
    public readonly axiosError?: AxiosError
  ) {
    // @ts-ignore: fetch requires lib "dom" or "webworker", but then the "cause" property becomes unknown to TS
    super(msg, { cause });
    this.name = this.constructor.name;
  }
}
