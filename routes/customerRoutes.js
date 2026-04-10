import express from "express";
import {
  createCustomerController,
  deleteCustomerController,
  getCustomerByIdController,
  getCustomerStatsController,
  listCustomersController,
  updateCustomerController,
} from "../controllers/customerController.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateAdmin);
router.get("/stats", getCustomerStatsController);
router.post("/", createCustomerController);
router.get("/", listCustomersController);
router.get("/:id", getCustomerByIdController);
router.put("/:id", updateCustomerController);
router.delete("/:id", deleteCustomerController);

export default router;
