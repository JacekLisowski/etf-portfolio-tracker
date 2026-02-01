export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('NOT_FOUND', message, 404, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: Record<string, unknown>) {
    super('UNAUTHORIZED', message, 401, details)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: Record<string, unknown>) {
    super('FORBIDDEN', message, 403, details)
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    service: string,
    message: string = 'External service unavailable',
    details?: Record<string, unknown>
  ) {
    super(`${service.toUpperCase()}_UNAVAILABLE`, message, 503, details)
  }
}
