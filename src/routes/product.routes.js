import { Router } from "express";
import {
  addDataToDB,
  checkingRouter,
  getDataWithPagination,
  getStatistics,
  getPriceRangeStatistics,
  getCategoryStatistics,
  getAllStatistics,
} from "../controllers/product.controller.js";

const router = Router();

router.route("/checking").get(checkingRouter);
router.route("/addDataToDB").get(addDataToDB);
router.route("/get-product").get(getDataWithPagination);
router.route("/get-statistics").get(getStatistics);
router.route("/get-price-statistics").get(getPriceRangeStatistics);
router.route("/get-category-statistics").get(getCategoryStatistics);
router.route("/get-all-statistics").get(getAllStatistics);

export default router;
