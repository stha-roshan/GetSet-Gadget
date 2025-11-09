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

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const validation = validateFields([
    {
      value: currentPassword,
      field: "currentPassword",
      validator: (val) => val && val.length > 0,
      message: "Current password is required",
    },
    {
      value: newPassword,
      field: "newPassword",
      validator: isValidPassword,
      message: "New password must be at least 8 characters long",
    },
  ]);

  if (!validation.isValid) {
    throw new ApiError(400, "Validation failed", MODULE, validation.errors);
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found", MODULE);
  }

  const isValidPassword = await verifyPassword(
    currentPassword,
    user.password,
    user.salt
  );

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid current password", MODULE);
  }

  const samePassword = await verifyPassword(
    newPassword,
    user.password,
    user.salt
  );

  if (samePassword) {
    throw new ApiError(
      400,
      "New password cannot be the same as the current password",
      MODULE
    );
  }

  const { salt, hash } = await hashPassword(newPassword);

  await User.updateOne({ _id: req.user._id }, { password: hash, salt });

  return res
    .status(200)
    .json(new ApiResponse(200, "Password changed successfully", null, MODULE));
});

export { registerUser, loginUser, logoutUser, changePassword };
