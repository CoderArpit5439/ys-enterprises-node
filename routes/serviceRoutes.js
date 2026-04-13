import express from "express";
import { getServiceBySlugController, listServicesController } from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", listServicesController);
router.get("/:slug", getServiceBySlugController);

export default router;
