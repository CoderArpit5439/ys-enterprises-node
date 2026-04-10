import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomerStats,
  listCustomers,
  updateCustomer,
} from "../services/customerService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const createCustomerController = asyncHandler(async (req, res) => {
  const customer = await createCustomer(req.body);
  return sendSuccess(res, 201, "Customer created successfully", customer);
});

export const listCustomersController = asyncHandler(async (req, res) => {
  const result = await listCustomers(req.query);
  return sendSuccess(res, 200, "Customers fetched successfully", result.rows, result.meta);
});

export const getCustomerByIdController = asyncHandler(async (req, res) => {
  const customer = await getCustomerById(req.params.id);
  return sendSuccess(res, 200, "Customer fetched successfully", customer);
});

export const updateCustomerController = asyncHandler(async (req, res) => {
  const customer = await updateCustomer(req.params.id, req.body);
  return sendSuccess(res, 200, "Customer updated successfully", customer);
});

export const deleteCustomerController = asyncHandler(async (req, res) => {
  await deleteCustomer(req.params.id);
  return sendSuccess(res, 200, "Customer deleted successfully");
});

export const getCustomerStatsController = asyncHandler(async (req, res) => {
  const stats = await getCustomerStats();
  return sendSuccess(res, 200, "Customer stats fetched successfully", stats);
});
