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
    console.log(err)
    return res.status(400).send(createErrorBody(String(err.message)));
  }
  else {
    return res.status(500).send(createErrorBody('Internal Server Error.'));
  }
};

async function logError(err: any, req: Request, res: Response, next: NextFunction) {
  console.log(err)
};

export { createErrorBody, handleError, logError };
export default handleError;
