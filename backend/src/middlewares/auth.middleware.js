import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const MODULE = "[USER-VERIFICATION] [auth.middleware.js]";
const verifyUser = async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        module: MODULE,
        message: "Unauthorized: No token provided",
      });
    }

    let decodedAccessToken;
    try {
      decodedAccessToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        module: MODULE,
        message:
          error.name === "TokenExpiredError"
            ? "Token expired"
            : "Invalid token",
        error: error.name,
      });
    }

    const user = await User.findById(decodedAccessToken?.id).select(
      "-password -salt -phoneNumber -refreshToken"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        module: MODULE,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      module: MODULE,
      message: "Internal server error",
    });
  }
};

export { verifyUser };
