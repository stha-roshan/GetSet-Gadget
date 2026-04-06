import { Admin } from "../models/admin.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessToken } from "../utils/jwt.js";
import {
  accessTokenCookieOption,
  refreshTokenCookieOption,
} from "../utils/cookieOptions.js";
import {
  isValidName,
  isValidEmail,
  isValidPassword,
} from "../utils/generalValidators.js";
import { validateFields } from "../utils/validatorFunctions.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";

const MODULE = "[ADMIN] [admin.controller.js]";

const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

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

  const { salt, hash } = await hashPassword(password);

  const newAdmin = await Admin.create({
    name,
    email: normalizedEmail,
    password: hash,
    salt,
  });

  const createdAdmin = await Admin.findById(newAdmin._id).select(
    "-password -salt",
  );

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "Admin registered successfully",
        createdAdmin,
        MODULE,
      ),
    );
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const validation = validateFields([
    {
      value: email,
      field: "email",
      validator: isValidEmail,
      message: "Please enter a valid email address (e.g., user@example.com)",
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

  const admin = await Admin.findOne({ email: email.trim().toLowerCase() });

  if (!admin) {
    throw new ApiError(401, "Invalid email or password", MODULE);
  }

  const isPasswordValid = await verifyPassword(
    password,
    admin.password,
    admin.salt,
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password", MODULE);
  }

  const tokenData = {
    id: admin._id,
    email: admin.email,
    name: admin.name,
  };

  const adminAccessToken = generateAccessToken(tokenData);

  const responseData = {
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
    },
  };

  if (process.env.NODE_ENV === "development") {
    responseData.adminAccessToken = adminAccessToken;
  }

  res
    .status(200)
    .cookie("adminAccessToken", adminAccessToken, accessTokenCookieOption)
    .json(
      new ApiResponse(
        200,
        "Admin logged in successfully",
        responseData,
        MODULE,
      ),
    );
});

export { registerAdmin, loginAdmin };
