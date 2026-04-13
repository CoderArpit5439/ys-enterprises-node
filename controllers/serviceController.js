import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getPublicServiceBySlug, listPublicServices } from "../services/serviceService.js";

export const listServicesController = asyncHandler(async (req, res) => {
  const services = await listPublicServices();
  return sendSuccess(res, 200, "Services fetched successfully", services);
});

export const getServiceBySlugController = asyncHandler(async (req, res) => {
  const service = await getPublicServiceBySlug(req.params.slug);
  return sendSuccess(res, 200, "Service fetched successfully", service);
});
