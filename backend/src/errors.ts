/**
 * errors.ts — Application error hierarchy.
 * Each error type maps to exactly one HTTP status in the route layer.
 */
import { dbError, type DriverError, type ErrorMapping } from './config/database.js';

export class AppError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

/** Convert any thrown error into an HTTP error mapping. */
export function toErrorResponse(err: Error): ErrorMapping {
  if (err instanceof AppError) return { status: err.status, error: err.message };
  return dbError(err as DriverError);
}
