// crypto.js - Remove asyncHandler
import crypto from "crypto";
import { ApiError } from "./ApiError.js";

const generateHash = async (total_amount, product_code) => { 
  const transaction_uuid = crypto.randomUUID();

  // console.log(transaction_uuid);
  // console.log(total_amount);
  // console.log(product_code);

  const data = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

  const secret = process.env.ESEWA_HMAC_SECRET;
  if (!secret) {
    throw new ApiError(500, "ESEWA HMAC secret is not configured");
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64");

  // console.log("Generated hash:", hash);
  // console.log("transaction_uuid:", transaction_uuid);
  
  return { hash, transaction_uuid };
};

export { generateHash };