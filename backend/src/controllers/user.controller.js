import { User } from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  accessTokenCookieOption,
  refreshTokenCookieOption,
} from "../utils/cookieOptions.js";
import {
  isValidName,
  isValidEmail,
  isValidPhoneNumber,
  isValidPassword,
} from "../utils/generalValidators.js";
import { validateFields } from "../utils/validatorFunctions.js";
import { sendOtpMail } from "../utils/mailService.js";
import crypto from "crypto";

const MODULE = "[USER] [user.controller.js]";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;

  const validation = validateFields([
    {
      value: name,
      field: "name",
      validator: isValidName,
      message:
        "Name must be 2-50 characters and contain only letters, spaces, apostrophes, and hyphens",
    },
    {
      value: email,
      field: "email",
      validator: isValidEmail,
      message: "Please enter a valid email address (e.g., user@example.com)",
    },
    {
      value: phoneNumber,
      field: "phoneNumber",
      validator: isValidPhoneNumber,
      message: "Phone number must be 10 digits starting with 97 or 98",
    },
    {
      value: password,
      field: "password",
      validator: isValidPassword,
      message: "Password must be at least 8 characters long",
    },
  ]);

  if (!validation.isValid) {
    throw new ApiError(400, "Validation failed", MODULE, validation.errors);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(
      409,
      "An account with this email already exists",
      MODULE
    );
  }

  const { salt, hash } = await hashPassword(password);

  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phoneNumber: phoneNumber.trim(),
    password: hash,
    salt,
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -salt"
  );

  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while creating your account. Please try again later.",
      MODULE
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Account created successfully! You can now login",
        createdUser,
        MODULE
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const validation = validateFields([
    {
      value: email,
      field: "email",
      validator: isValidEmail,
      message: "Please enter a valid email address",
    },
    {
      value: password,
      field: "password",
      validator: (val) => val && val.length > 0,
      message: "Password is required",
    },
  ]);

  if (!validation.isValid) {
    throw new ApiError(400, "Invalid credentials", MODULE, validation.errors);
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    throw new ApiError(401, "Invalid email or password", MODULE);
  }

  const isValid = await verifyPassword(password, user.password, user.salt);

  if (!isValid) {
    throw new ApiError(401, "Invalid email or password", MODULE);
  }

  const tokenData = {
    id: user._id,
    name: user.name,
    email: user.email,
  };

  const accessToken = generateAccessToken(tokenData);
  const refreshToken = generateRefreshToken(tokenData);

  user.refreshToken = refreshToken;
  await user.save();

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

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenCookieOption)
    .cookie("refreshToken", refreshToken, refreshTokenCookieOption)
    .json(new ApiResponse(200, "Login successful", responseData, MODULE));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: null } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", accessTokenCookieOption)
    .clearCookie("refreshToken", refreshTokenCookieOption)
    .json(new ApiResponse(200, "Logout successful", null, MODULE));
});

const requestPasswordChangeOtp = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const validation = validateFields([
    { value: currentPassword, field: "currentPassword", validator: (val) => val?.length > 0, message: "Current password is required" },
    { value: newPassword, field: "newPassword", validator: isValidPassword, message: "New password must be at least 8 characters long" },
  ]);

  if (!validation.isValid) throw new ApiError(400, "Validation failed", MODULE, validation.errors);

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found", MODULE);

  const isMatch = await verifyPassword(currentPassword, user.password, user.salt);
  if (!isMatch) throw new ApiError(401, "Invalid current password", MODULE);

  const samePassword = await verifyPassword(newPassword, user.password, user.salt);
  if (samePassword) throw new ApiError(400, "New password cannot be the same as the current password", MODULE);

  // Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 mins

  await User.updateOne(
    { _id: req.user._id }, 
    { passwordChangeOtp: otp, passwordChangeOtpExpiry: expiry }
  );

  try {
    await sendOtpMail(user.email, otp);
  } catch (error) {
    console.error("Mail Error:", error);
    throw new ApiError(500, "Failed to send email", MODULE);
  }

  return res.status(200).json(new ApiResponse(200, "OTP sent to your email", null, MODULE));
});

const verifyAndChangePassword = asyncHandler(async (req, res) => {
  const { otp, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  
  if (
    !user || 
    user.passwordChangeOtp !== otp || 
    !user.passwordChangeOtpExpiry || 
    user.passwordChangeOtpExpiry < Date.now()
  ) {
    throw new ApiError(400, "Invalid or expired OTP", MODULE);
  }

  const { salt, hash } = await hashPassword(newPassword);
  
  await User.updateOne(
    { _id: req.user._id }, 
    { 
      password: hash, 
      salt, 
      $unset: { passwordChangeOtp: 1, passwordChangeOtpExpiry: 1 } 
    }
  );

  return res.status(200).json(new ApiResponse(200, "Password changed successfully", null, MODULE));
});

const getCurrentUser = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id).select("-password -salt -refreshToken -passwordChangeOtp -passwordChangeOtpExpiry");

  if (!user) {
    throw new ApiError(404, "User not found", MODULE);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User profile fetched successfully", user, MODULE));
});


export { registerUser, loginUser, logoutUser, requestPasswordChangeOtp, verifyAndChangePassword, getCurrentUser };
