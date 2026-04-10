import express from "express";
import {
  createWorkDiaryController,
  deleteWorkDiaryController,
  getWorkDiaryByIdController,
  listWorkDiaryController,
  updateWorkDiaryController,
} from "../controllers/workDiaryController.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authenticateAdmin);
router.post("/", createWorkDiaryController);
router.get("/", listWorkDiaryController);
router.get("/:id", getWorkDiaryByIdController);
router.put("/:id", updateWorkDiaryController);
router.delete("/:id", deleteWorkDiaryController);

export default router;
