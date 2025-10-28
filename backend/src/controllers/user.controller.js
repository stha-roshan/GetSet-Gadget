import { User } from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

const MODULE = "[USER-REGISTRATION] [user.controller.js]";

const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const nameRegex = /^[A-Za-z\s'-]+$/;
const phoneNumberRegex = /^(98|97)[0-9]{8}$/;

const accessTokenCookieOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  maxAge: 60 * 60 * 1000,
  path: "/",
  sameSite: "strict",
};

const refreshTokenCookieOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/users/refresh",
  sameSite: "strict",
};

const registerUser = async (req, res) => {
  let validationErrors = [];

  try {
    const { name, email, phoneNumber, password } = req.body;

    if (!nameRegex.test(name?.trim()))
      validationErrors.push(
        "Name can only contain letters, spaces, apostrophes, and hyphens."
      );

    if (!emailRegex.test(email?.trim()))
      validationErrors.push(
        "Please enter a valid email address (e.g., user@example.com)."
      );

    if (!phoneNumberRegex.test(phoneNumber?.trim()))
      validationErrors.push(
        "Phone number must be 10 digits long and start with 97 or 98."
      );

    if (!password || password.length < 8)
      validationErrors.push(
        "Password must be at least 8 characters long for security reasons."
      );

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        module: `${MODULE} registerUser`,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        module: `${MODULE} registerUser`,
        message: "An account with this email already exists.",
      });
    }

    const { salt, hash } = await hashPassword(password);
    const newUser = await User.create({
      name,
      email,
      phoneNumber,
      password: hash,
      salt,
    });

    const createdUser = await User.findById(newUser._id).select(
      "-password -salt"
    );

    if (!createdUser) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        module: `${MODULE} registerUser`,
        message:
          "Something went wrong while creating your account. Please try again later.",
      });
    }

    return res.status(201).json({
      success: true,
      statusCode: 201,
      module: `${MODULE} registerUser`,
      message: "Account created successfully! You can now log in.",
      user: createdUser,
    });
  } catch (error) {
    console.error(
      `${MODULE} registerUser -> Registration failed: ${error.message}`
    );
    if (process.env.NODE_ENV === "development") console.error(error.stack);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      module: `${MODULE} registerUser`,
      message:
        "A server error occurred during registration. Please try again later.",
    });
  }
};

const loginUser = async (req, res) => {
  const validationErrors = [];
  try {
    const { email, password } = req.body;

    if (!emailRegex.test(email?.trim()))
      validationErrors.push("Invalid email provided");

    if (!password) {
      validationErrors.push("Password must not be empty");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        module: `${MODULE} loginUser`,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        module: `${MODULE} loginUser`,
        message: "Invalid email or password",
      });
    }

    const isValid = await verifyPassword(password, user.password, user.salt);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        module: `${MODULE} loginUser`,
        message: "Invalid email or password",
      });
    }

    const data = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    const accessToken = generateAccessToken(data);
    const refreshToken = generateRefreshToken(data);

    const responseData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };

    if (process.env.NODE_ENV === "development") {
      responseData.accessToken = accessToken;
      responseData.refreshToken = refreshToken;
    }

    user.refreshToken = refreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, accessTokenCookieOption)
      .cookie("refreshToken", refreshToken, refreshTokenCookieOption)
      .json({
        success: true,
        statusCode: 200,
        module: `${MODULE} loginUser`,
        message: "Login successfull",
        data: responseData,
      });
  } catch (error) {
    console.error(`${MODULE} loginUser -> Login error:`, error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      module: `${MODULE} loginUser`,
      message: "Internal server error",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const id = req.user._id;

    if (!id) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        module: `${MODULE} logoutUser`,
        message: "User not found or not authenticated",
      });
    }

    await User.findByIdAndUpdate(
      id,
      {
        $set: {
          refreshToken: null,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .clearCookie("accessToken", accessTokenCookieOption)
      .clearCookie("refreshToken", refreshTokenCookieOption)
      .json({
        success: true,
        statusCode: 200,
        module: `${MODULE} logoutUser`,
        message: "Logout successfull",
      });
  } catch (error) {
    console.error("Logout Error:", error.message);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      module: `${MODULE} logoutUser`,
      message: "Something went wrong during logout",
      error: error.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        module: `${MODULE} changePassword`,
        message: "Invalid input: password must be at least 8 characters long.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        module: `${MODULE} changePassword`,
        message: "User not found",
      });
    }

    const isValidPassword = await verifyPassword(
      currentPassword,
      user.password,
      user.salt
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        module: `${MODULE} changePassword`,
        message: "Invalid current password",
      });
    }

    const samePassword = await verifyPassword(
      newPassword,
      user.password,
      user.salt
    );
    if (samePassword) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        module: `${MODULE} changePassword`,
        message: "New password cannot be the same as the current one.",
      });
    }

    const { salt, hash } = await hashPassword(newPassword);

    const result = await User.updateOne(
      { _id: req.user._id },
      { password: hash, salt }
    );

    return res.status(200).json({
      success: true,
      statusCode: 200,
      module: `${MODULE} changePassword`,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error while changing password:", error);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      module: `${MODULE} changePassword`,
      message: "Something went wrong while changing password",
    });
  }
};

export { registerUser, loginUser, logoutUser, changePassword };
