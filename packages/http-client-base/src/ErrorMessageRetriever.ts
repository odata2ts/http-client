/**
 * Function type used to retrieve the error message from the response payload.
 *
 * @return error message or <code>undefined</code> if retrieval failed / had no outcome
 */
export type ErrorMessageRetriever = (errorResponse: any) => string | undefined;

/**
 * Retrieves the OData error message from the response (V2 and V4 are supported).
 * The structure of the error message is specified by OData.
 *
 * @param errorResponse
 */
export const retrieveErrorMessage: ErrorMessageRetriever = (errorResponse: any): string | undefined => {
  const eMsg = errorResponse?.error?.message;
  return typeof eMsg?.value === "string" ? eMsg.value : eMsg;
};
