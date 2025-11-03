class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    module = null,
    errors = [],
    stack = ""
  ) {
    super(message);
    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.data = null;

    if (module) {
      this.module = module;
    }

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
