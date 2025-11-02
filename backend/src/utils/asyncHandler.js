import { ApiError } from "../utils/ApiError.js";
const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      console.error(`[asyncHandler] Error caught:`, {
        message: error.message || error,
        isApiError: error instanceof ApiError,
        stack: error.stack || "No stack trace available",
      });

      if (error instanceof ApiError) {
        return res.status(error.statusCode || 500).json({
          success: false,
          statusCode: error.statusCode,
          message: error.message,
          module: error.module ? error.module : undefined,
          errors: error.errors ? error.errors : undefined,
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "An unexpected error occurred",
        statusCode: 500,
      });
    }
  };
};

export { asyncHandler };
