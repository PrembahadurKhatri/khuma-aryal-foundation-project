export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join(", ");
  }

  // Multer's own errors (file too large, too many files, etc) and the
  // fileFilter rejections thrown in middleware/upload.js (wrong mimetype)
  // both surface here as plain Errors with no distinguishing status —
  // previously fell through to a generic 500. Cloudinary's own rejections
  // (e.g. "An unknown file format not allowed" for a corrupt/unsupported
  // upload) also come through as a plain Error with this http_code, so
  // check that too rather than just err.name.
  if (err.name === "MulterError" || err.http_code === 400) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
