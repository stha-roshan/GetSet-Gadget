class ApiResponse {
  constructor(statusCode, message, data = null, module = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (module) {
      this.module = module;
    }
  }
}

export { ApiResponse };
