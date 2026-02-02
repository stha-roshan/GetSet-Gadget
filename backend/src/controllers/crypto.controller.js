import { generateHash } from "../utils/crypto.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";    
import {ApiResponse} from "../utils/ApiResponse.js";

const createCryptoHash = asyncHandler(
  async (req, res) => {
    const { total_amount, product_code } = req.body;

    console.log("Received data:", req.body);
    
    if(!total_amount || !product_code) {
      throw new ApiError(400, "total_amount and product_code are required");
    }

    const { hash, transaction_uuid } = await generateHash(total_amount, product_code);

    return res.status(200).json(new ApiResponse(200, "Hash generated successfully ", { hash, transaction_uuid } ));
  }
);

export { createCryptoHash };