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
router.route("/get-stats").get(getStatistics);
router.route("/get-piechart-data").get(getPriceRangeStatistics);
router.route("/get-barchart-data").get(getCategoryStatistics);
router.route("/get-all-statistics").get(getAllStatistics);

export default router;
