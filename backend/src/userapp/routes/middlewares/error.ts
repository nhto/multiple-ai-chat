import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../../../models/model";
import { ApiError } from "../../../models/error";
import logger from "../../../utilities/logger";

function createErrorBody(message: string): ApiResponse<void> {
  return {
    success: false,
    message,
    data: null
  };
}

async function handleError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(200).send(createErrorBody(String(err.message)));
  }  else {
    return res.status(200).send(createErrorBody('Internal Server Error.'));
  }
};

export { createErrorBody, handleError };
export default handleError;
