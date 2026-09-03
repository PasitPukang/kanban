import { Request, Response, NextFunction } from 'express'

/**
 * Custom App Error class with HTTP status code
 */
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Global Error Handling Middleware
 * Prevents server crashes and formats error responses uniformly
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || (err.status ? Number(err.status) : 500)
  const message = err.message || 'Internal Server Error'

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error ${statusCode}]:`, err)
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}
