import { User } from "../models/user.model.js";
import { hashPassword } from "../utils/hash.js";

const MODULE = "[USER-REGISTRATION] [user.controller.js]";

const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const nameRegex = /^[A-Za-z\s'-]+$/;
const phoneNumberRegex = /^(98|97)[0-9]{8}$/;

const registerUser = async (req, res) => {
  const validationErrors = [];

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
        module: MODULE,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        module: MODULE,
        message: "An account with this email already exists.",
      });
    }

    const {salt, hash} = await hashPassword(password)
    const newUser = await User.create({
      name,
      email,
      phoneNumber,
      password: hash,
      salt
    });

    const createdUser = await User.findById(newUser._id).select("-password -salt");

    if (!createdUser) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        module: MODULE,
        message:
          "Something went wrong while creating your account. Please try again later.",
      });
    }

    return res.status(201).json({
      success: true,
      statusCode: 201,
      module: MODULE,
      message: "Account created successfully! You can now log in.",
      user: createdUser,
    });
  } catch (error) {
    console.error(`${MODULE} Registration failed: ${error.message}`);
    if (process.env.NODE_ENV === "development") console.error(error.stack);

    return res.status(500).json({
      success: false,
      statusCode: 500,
      module: MODULE,
      message:
        "A server error occurred during registration. Please try again later.",
    });
  }
};

export { registerUser };
