import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
import jwt from "jsonwebtoken";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let errorName = err.name || "Error";
  let errors: any = [];

  /**
   * Prisma Validation Error
   */
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid data or missing required fields.";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    /**
     * Prisma Known Errors
     */
    switch (err.code) {
      case "P2002":
        statusCode = httpStatus.CONFLICT;
        message = "Duplicate value. This record already exists.";
        break;

      case "P2003":
        statusCode = httpStatus.BAD_REQUEST;
        message = "Foreign key constraint failed.";
        break;

      case "P2025":
        statusCode = httpStatus.NOT_FOUND;
        message = "Record not found.";
        break;

      default:
        statusCode = httpStatus.BAD_REQUEST;
        message = err.message;
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    /**
     * Prisma Initialization Errors
     */
    switch (err.errorCode) {
      case "P1000":
        statusCode = httpStatus.UNAUTHORIZED;
        message = "Database authentication failed.";
        break;

      case "P1001":
        statusCode = httpStatus.SERVICE_UNAVAILABLE;
        message = "Cannot connect to database.";
        break;

      default:
        statusCode = httpStatus.INTERNAL_SERVER_ERROR;
        message = err.message;
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    /**
     * Prisma Unknown Error
     */
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = "Unknown database error.";
  } else if (err instanceof jwt.TokenExpiredError) {
    /**
     * JWT Expired
     */
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Token has expired.";
  } else if (err instanceof jwt.JsonWebTokenError) {
    /**
     * Invalid JWT
     */
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid token.";
  } else if (err.name === "ZodError") {
    /**
     * Zod Validation Error
     */
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation failed.";

    errors = err.issues.map((e: any) => ({
      path: e.path.join("."),
      message: e.message,
    }));
  } else if (err.statusCode) {
    /**
     * Custom App Error
     */
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    /**
     * Native Error
     */
    message = err.message;
  }

  res.status(statusCode!).json({
    success: false,
    statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
    name: errorName,
    message: message,
    errors,
    error: err.stack,
  });
};
