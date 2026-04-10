export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundHandler(app) {
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.originalUrl}`,
    });
  });
}

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
    ...(error.details ? { details: error.details } : {}),
    ...(process.env.NODE_ENV !== "production" && error.stack ? { stack: error.stack } : {}),
  });
}
