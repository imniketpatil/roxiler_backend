import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import axios from "axios";

const checkingRouter = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Hey Niket Patil" });
});

const addDataToDB = asyncHandler(async (req, res) => {
  try {
    const thirdPartyAPIUrl =
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json";

    const response = await axios.get(thirdPartyAPIUrl);
    const products = response.data;

    const insertedProducts = await Product.insertMany(products);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          insertedProducts,
          "Products retrieved successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Unable To Add Data to DB");
  }
});

export { checkingRouter, addDataToDB, getProductPagination };
