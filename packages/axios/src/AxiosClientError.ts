import type { AxiosError } from "axios";

export class AxiosClientError extends Error {
  constructor(
    msg: string,
    public readonly status: number | undefined,
    public readonly cause: Error | AxiosError | undefined
  ) {
    super(msg, { cause });
    this.name = this.constructor.name;
  }
}
