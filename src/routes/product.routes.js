import { Router } from "express";
import {
  addDataToDB,
  checkingRouter,
  getProductPagination,
} from "../controllers/product.controller.js";

const router = Router();

router.route("/checking").get(checkingRouter);
router.route("/addDataToDB").get(addDataToDB);
router.route("/get-product").get(getProductPagination);

addDataToDB;

export default router;
