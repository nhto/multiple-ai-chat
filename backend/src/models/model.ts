type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
}

function createApiResponse<T>(message: string | null, data: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data
  };
}

export {
  ApiResponse,
  createApiResponse
}
