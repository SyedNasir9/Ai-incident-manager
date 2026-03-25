/**
 * User-visible copy only — never surface raw backend payloads or stack traces in the UI.
 */

/** HTTP / transport → safe, generic message */
export function friendlyMessageForHttpStatus(status: number | undefined, axiosCode?: string): string {
  if (status === undefined) {
    if (axiosCode === "ECONNABORTED") {
      return "The request took too long. Please try again.";
    }
    return "We couldn’t reach the server. Check your connection and try again.";
  }

  switch (status) {
    case 400:
      return "This request couldn’t be processed. Please try again.";
    case 401:
      return "You’re not signed in or your session may have expired.";
    case 403:
      return "You don’t have permission to do that.";
    case 404:
      return "We couldn’t find what you were looking for.";
    case 408:
    case 504:
      return "The server took too long to respond. Please try again.";
    case 422:
      return "Something was wrong with the request. Please try again.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    default:
      if (status >= 500) {
        return "Something went wrong on our side. Please try again in a moment.";
      }
      if (status >= 400) {
        return "We couldn’t complete this request. Please try again.";
      }
      return "Something went wrong. Please try again.";
  }
}
