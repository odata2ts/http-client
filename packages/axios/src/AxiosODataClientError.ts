import { AxiosError } from "axios";

export class AxiosODataClientError extends Error {
  constructor(msg: string, public status?: number, cause?: Error, public response?: AxiosError) {
    super(msg, { cause });
    this.name = this.constructor.name;
  }
}
