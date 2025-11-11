import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { generateAccessToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const MODULE = "[TOKEN-REFRESH] [auth.controller.js]";

const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh Token not found", MODULE);
  }

  let decodedRefreshToken;
  try {
    decodedRefreshToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token", MODULE);
  }

  const user = await User.findOne({
    _id: decodedRefreshToken.id,
    refreshToken: refreshToken,
  });

  if (!user) {
    throw new ApiError(401, "Refresh token not found or revoked");
  }

  const tokenData = {
    id: user._id,
    name: user.name,
    email: user.email,
  };

  const newAccessToken = generateAccessToken(tokenData);

  const accessTokenCookieOption = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: 60 * 60 * 1000, // 1 hour
    path: "/",
    sameSite: "strict",
  };

  const responseData = {
    message: "Access token refreshed successfully",
  };

  if (process.env.NODE_ENV === "development") {
    responseData.accessToken = newAccessToken;
  }

  return res
    .status(200)
    .cookie("accessToken", newAccessToken, accessTokenCookieOption)
    .json(
      new ApiResponse(
        200,
        "Access Token refreshed successfully",
        responseData,
        MODULE
      )
    );
});

export { refreshAccessToken };
