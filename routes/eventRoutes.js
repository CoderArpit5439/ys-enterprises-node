import express from "express";
import {
  createEventController,
  deleteEventController,
  listAdminEventsController,
  listEventsController,
  updateEventController,
} from "../controllers/eventController.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", listEventsController);
router.get("/admin/list", authenticateAdmin, listAdminEventsController);
router.post("/", authenticateAdmin, createEventController);
router.put("/:id", authenticateAdmin, updateEventController);
router.delete("/:id", authenticateAdmin, deleteEventController);

export default router;
