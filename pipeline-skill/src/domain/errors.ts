/**
 * Domain-wide error type. Mirrors the original caibao `AppError` so the
 * extracted pipeline keeps the same shape when callers consume it.
 */
export class AppError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: Record<string, unknown>

  constructor(
    code: string,
    message: string,
    options: { status?: number; details?: Record<string, unknown>; cause?: unknown } = {}
  ) {
    super(message, { cause: options.cause })
    this.name = 'AppError'
    this.code = code
    this.status = options.status ?? 400
    this.details = options.details
  }
}

export function asAppError(error: unknown): AppError {
  if (error instanceof AppError) return error
  return new AppError('INTERNAL_ERROR', 'Unexpected internal error', {
    status: 500,
    cause: error
  })
}