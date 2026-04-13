import express from "express";
import {
  createInquiryController,
  deleteInquiryController,
  listInquiriesController,
  updateInquiryStatusController,
} from "../controllers/inquiryController.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createInquiryController);
router.get("/", authenticateAdmin, listInquiriesController);
router.patch("/:id/status", authenticateAdmin, updateInquiryStatusController);
router.delete("/:id", authenticateAdmin, deleteInquiryController);

export default router;
