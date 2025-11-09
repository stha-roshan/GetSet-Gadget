import { User } from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { accessTokenCookieOption, refreshTokenCookieOption } from "../utils/cookieOptions.js";

const MODULE = "[USER-REGISTRATION] [user.controller.js]";

const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const nameRegex = /^[A-Za-z\s'-]+$/;
const phoneNumberRegex = /^(98|97)[0-9]{8}$/;



const registerUser = asyncHandler(async (req, res) => {
  let validationErrors = [];
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
    throw new ApiError(
      400,
      "Incalid fields provided",
      MODULE,
      validationErrors
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "An accout with this email already exists", MODULE);
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
  const validationErrors = [];
  const { email, password } = req.body;

  if (!emailRegex.test(email?.trim()))
    validationErrors.push("Invalid email provided");

  if (!password) {
    validationErrors.push("Password must not be empty");
  }

  if (validationErrors.length > 0) {
    throw new ApiError(400, "Invalid credentials", MODULE, validationErrors);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password", MODULE);
  }

  const isValid = await verifyPassword(password, user.password, user.salt);

  if (!isValid) {
    throw new ApiError(401, "Invalid email or password", MODULE);
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
    .json(new ApiResponse(200, "login successfull", responseData, MODULE));
});

const logoutUser = asyncHandler(async (req, res) => {
  const id = req.user._id;

  if (!id) {
    throw new ApiError(400, "User not found or not authenticated", MODULE);
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
    .json(new ApiResponse(200, "Logout successfull", null, MODULE));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    throw new ApiError(
      400,
      "Invalid input: password must be at least 8 characters long.",
      MODULE
    );
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
      "New password cannot be the same as the current one.",
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
