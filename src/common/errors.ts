import { Response } from "express";
import logger from "./logger";
import { buildResponse } from "./utils";

export class ForbiddenError extends Error {
  constructor(public message: string) {
    super(message);
  }
}

export class ValidationFailedError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = "ValidationFailedError";
  }
}

export class ResourceNotFoundError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = "ResourceNotFoundError";
  }
}

export const errorHandler = (res: Response, error: Error) => {
  logger.error(error);

  if (
    error instanceof ValidationFailedError ||
    error instanceof ResourceNotFoundError ||
    error instanceof ForbiddenError
  ) {
    return res.status(400).send(buildResponse("", error.message, error));
  }

  return res.status(500).send(buildResponse("", "Server Error", error));
};
