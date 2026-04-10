export function sendSuccess(res, statusCode, message, data = null, meta = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== null ? { data } : {}),
    ...(meta ? { meta } : {}),
  });
}
