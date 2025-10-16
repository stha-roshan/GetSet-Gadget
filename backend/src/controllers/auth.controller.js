import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { generateAccessToken } from "../utils/jwt.js";

const MODULE = "[TOKEN-REFRESH] [auth.controller.js]";

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        module: MODULE,
        message: "Refresh token not found",
      });
    }

    let decodedRefreshToken;
    try {
      decodedRefreshToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        module: MODULE,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findOne({
      _id: decodedRefreshToken.id,
      refreshToken: refreshToken,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        module: MODULE,
        message: "Refresh token not found or revoked",
      });
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
      .json({
        success: true,
        statusCode: 200,
        module: MODULE,
        data: responseData,
      });
  } catch (error) {
    console.error(`${MODULE} Refresh token error:`, error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      module: MODULE,
      message: "Internal server error",
    });
  }
};

export { refreshAccessToken };
