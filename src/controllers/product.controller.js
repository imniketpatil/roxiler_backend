import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import axios from "axios";

const getCategoryStatisticsFn = async (month) => {
  return Product.aggregate([
    {
      $match: {
        $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(month)] },
      },
    },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        category: "$_id",
        count: 1,
        _id: 0,
      },
    },
  ]);
};

const getPriceRangeStatisticsFn = async (month) => {
  return Product.aggregate([
    {
      $match: {
        $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(month)] },
      },
    },
    {
      $project: {
        price: 1,
      },
    },
  ]).then((itemsInMonth) => {
    const priceRanges = [
      { range: "0-100", min: 0, max: 100 },
      { range: "101-200", min: 101, max: 200 },
      { range: "201-300", min: 201, max: 300 },
      { range: "301-400", min: 301, max: 400 },
      { range: "401-500", min: 401, max: 500 },
      { range: "501-600", min: 501, max: 600 },
      { range: "601-700", min: 601, max: 700 },
      { range: "701-800", min: 701, max: 800 },
      { range: "801-900", min: 801, max: 900 },
      { range: "901-above", min: 901, max: Infinity },
    ];

    let result = priceRanges.map((range) => ({
      range: range.range,
      count: 0,
    }));

    itemsInMonth.forEach((item) => {
      priceRanges.forEach((range, index) => {
        if (item.price >= range.min && item.price <= range.max) {
          result[index].count += 1;
        }
      });
    });

    return result;
  });
};

const getGeneralStatisticsFn = async (month) => {
  return Product.aggregate([
    {
      $match: {
        $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(month)] },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$price" },
        totalSoldItems: { $sum: 1 },
        totalNotSoldItems: {
          $sum: { $cond: [{ $eq: ["$sold", false] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        totalSales: 1,
        totalSoldItems: 1,
        totalNotSoldItems: 1,
        _id: 0,
      },
    },
  ]).then((stats) => stats[0] || {});
};

const checkingRouter = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Hey Niket Patil" });
});

const addDataToDB = asyncHandler(async (req, res) => {
  try {
    const thirdPartyAPIUrl = process.env.THIRD_PARTY_API_URL;

    const response = await axios.get(thirdPartyAPIUrl);
    const products = response.data;
    await Product.deleteMany({});
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

const getDataWithPagination = asyncHandler(async (req, res) => {
  try {
    const { month, search = "", page = 1, perPage = 10 } = req.query;

    if (isNaN(month) || month < 1 || month > 12) {
      throw new ApiError(400, "Invalid month value");
    }
    if (isNaN(page) || page < 1 || isNaN(perPage) || perPage < 1) {
      throw new ApiError(400, "Invalid pagination parameters");
    }

    const skip = (page - 1) * perPage;

    let query = {
      $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(month)] },
    };

    if (search) {
      const numericSearch = !isNaN(search) ? parseFloat(search) : null;
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        ...(numericSearch !== null ? [{ price: numericSearch }] : []),
      ];
    }

    const [transactions, total] = await Promise.all([
      Product.find(query).skip(skip).limit(perPage),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      transactions,
      total,
      page: Number(page),
      perPage: Number(perPage),
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new ApiError(500, "Unable To Fetch Data");
  }
});

const getStatistics = asyncHandler(async (req, res) => {
  try {
    const { month } = req.query;

    if (isNaN(month) || month < 1 || month > 12) {
      throw new ApiError(400, "Invalid month value");
    }

    const totalSaleAmount = await getGeneralStatisticsFn(month);

    const totalSoldItems = await Product.countDocuments({
      $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(month)] },
      sold: true,
    });

    const totalUnsoldItems = await Product.countDocuments({
      $expr: { $eq: [{ $month: "$dateOfSale" }, parseInt(month)] },
      sold: false,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          totalSaleAmount: totalSaleAmount[0]
            ? totalSaleAmount[0].totalAmount
            : 0,
          totalSoldItems,
          totalUnsoldItems,
        },
        "Statistics retrieved successfully"
      )
    );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Unable to fetch statistics");
  }
});

const getPriceRangeStatistics = asyncHandler(async (req, res) => {
  try {
    const { month } = req.query;

    if (!month || isNaN(month) || month < 1 || month > 12) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Month is required"));
    }

    const result = await getPriceRangeStatisticsFn(month);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Price range statistics retrieved successfully"
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "Unable to fetch price range statistics");
  }
});

const getCategoryStatistics = asyncHandler(async (req, res) => {
  try {
    const { month } = req.query;

    if (!month || isNaN(month) || month < 1 || month > 12) {
      throw new ApiError(400, "Invalid month value");
    }

    const categoryStats = await getCategoryStatisticsFn(month);

    if (!categoryStats.length) {
      throw new ApiError(400, "No categories found for the selected month");
    }

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          categoryStats,
          "Category statistics retrieved successfully"
        )
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(400, "Unable to fetch category statistics");
  }
});

const getAllStatistics = asyncHandler(async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Month is required"));
    }

    const [categoryStats, priceRangeStats, generalStats] = await Promise.all([
      getCategoryStatisticsFn(month),
      getPriceRangeStatisticsFn(month),
      getGeneralStatisticsFn(month),
    ]);

    const finalResponse = {
      categoryStats,
      priceRangeStats,
      generalStats,
    };

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          finalResponse,
          "All statistics retrieved successfully"
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(new ApiResponse(500, null, "Unable to fetch statistics"));
  }
});

export {
  checkingRouter,
  addDataToDB,
  getDataWithPagination,
  getStatistics,
  getPriceRangeStatistics,
  getCategoryStatistics,
  getAllStatistics,
};
