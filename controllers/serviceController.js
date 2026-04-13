import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createService,
  deleteService,
  getPublicServiceBySlug,
  listAdminServices,
  listPublicServices,
  updateService,
} from "../services/serviceService.js";

export const listServicesController = asyncHandler(async (req, res) => {
  const services = await listPublicServices();
  return sendSuccess(res, 200, "Services fetched successfully", services);
});

export const getServiceBySlugController = asyncHandler(async (req, res) => {
  const service = await getPublicServiceBySlug(req.params.slug);
  return sendSuccess(res, 200, "Service fetched successfully", service);
});

export const listAdminServicesController = asyncHandler(async (req, res) => {
  const services = await listAdminServices();
  return sendSuccess(res, 200, "Admin services fetched successfully", services);
});

export const createServiceController = asyncHandler(async (req, res) => {
  const service = await createService(req.body);
  return sendSuccess(res, 201, "Service created successfully", service);
});

export const updateServiceController = asyncHandler(async (req, res) => {
  const service = await updateService(req.params.id, req.body);
  return sendSuccess(res, 200, "Service updated successfully", service);
});

export const deleteServiceController = asyncHandler(async (req, res) => {
  await deleteService(req.params.id);
  return sendSuccess(res, 200, "Service deleted successfully");
});
