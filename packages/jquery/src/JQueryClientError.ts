/// <reference path="../../../node_modules/@types/jquery/misc.d.ts" />

export class JQueryClientError extends Error {
  status?: number;
  cause?: JQuery.jqXHR;
  constructor(
    msg: string,
    public readonly status: number | undefined,
    public readonly cause: Error | JQuery.jqXHR | undefined
  ) {
    super(msg, { cause });
    this.name = this.constructor.name;
  }
}
