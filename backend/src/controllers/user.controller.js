import { User } from "../models/user.model.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

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
    throw new ApiError(400, "Invalid credentials", MODULE);
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
    .json({
      success: true,
      statusCode: 200,
      module: `${MODULE} loginUser`,
      message: "Login successfull",
      data: responseData,
    });
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
    .json({
      success: true,
      statusCode: 200,
      module: `${MODULE} logoutUser`,
      message: "Logout successfull",
    });
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
});

export { registerUser, loginUser, logoutUser, changePassword };
