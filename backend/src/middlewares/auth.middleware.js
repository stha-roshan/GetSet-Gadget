import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";

const MODULE = "[USER-Admin-VERIFICATION] [auth.middleware.js]";
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
      "-password -salt -refreshToken"
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



const isAdmin = async (req, res, next) => {
  try {
    const adminAccessToken =
      req.cookies?.adminAccessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

      // console.log("Admin Access Token:", adminAccessToken);

    if (!adminAccessToken) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        module: MODULE,
        message: "Unauthorized: No admin token provided",
      });
    }

    let decodedAdminAccessToken;
    try {
      decodedAdminAccessToken = jwt.verify(
        adminAccessToken,
        process.env.ACCESS_TOKEN_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        module: MODULE,
        message:
          error.name === "TokenExpiredError"
            ? "Admin token expired"
            : "Invalid admin token",
        error: error.name,
      });
    }

    const admin = await Admin.findById(decodedAdminAccessToken?.id).select("-password -salt -refreshToken");
    // console.log("Decoded Admin Access Token:", decodedAdminAccessToken);
    // console.log("Admin :", admin);
    if(!admin){
      return res.status(404).json({
        success: false,
        statusCode: 404,
        module: MODULE,
        message: "Admin not found",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin verification error:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      module: MODULE,
      message: "Internal server error",
    });
  }
};

export { verifyUser, isAdmin };
