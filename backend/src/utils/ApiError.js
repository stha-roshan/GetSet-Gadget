class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    module,
    errors = [],
    stack = ""
  ) {
    super(message);
    this.success = false;
    this.statusCode = statusCode;
    this.module = module;
    this.message = message;
    this.errors = errors;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}


export { ApiError}