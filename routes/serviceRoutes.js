import express from "express";
import {
  createServiceController,
  deleteServiceController,
  getServiceBySlugController,
  listAdminServicesController,
  listServicesController,
  updateServiceController,
} from "../controllers/serviceController.js";
import { authenticateAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", listServicesController);
router.get("/admin/list", authenticateAdmin, listAdminServicesController);
router.post("/", authenticateAdmin, createServiceController);
router.put("/:id", authenticateAdmin, updateServiceController);
router.delete("/:id", authenticateAdmin, deleteServiceController);
router.get("/:slug", getServiceBySlugController);

export default router;
