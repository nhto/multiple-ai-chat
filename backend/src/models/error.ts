
class ApiError implements Error {
  constructor(message: string) {
    this.name = "ApiError";
    this.message = message;
  }
  name: string;
  message: string;
  stack?: string;
}

const apiSessionTimeoutError = new ApiError("Session Timeout.");
const apiUnauthorizedError = new ApiError("Unauthorized.");
const apiInternalServerError = new ApiError("API Internal Server Error.");

export { ApiError, apiSessionTimeoutError, apiUnauthorizedError, apiInternalServerError };