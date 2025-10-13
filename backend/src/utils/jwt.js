import jwt from "jsonwebtoken";

const generateAccessToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
  };

  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET not defined");
  }
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });

  return accessToken;
};

export { generateAccessToken };
