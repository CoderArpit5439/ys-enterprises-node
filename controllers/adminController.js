import { createAdmin, loginAdmin } from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  validateAdminCreatePayload,
  validateAdminLoginPayload,
} from "../utils/validators.js";

export const adminRegister = asyncHandler(async (req, res) => {
  validateAdminCreatePayload(req.body);
  const admin = await createAdmin(req.body);
  return sendSuccess(res, 201, "Admin created successfully", admin);
});

export const adminLogin = asyncHandler(async (req, res) => {
  validateAdminLoginPayload(req.body);
  const result = await loginAdmin(req.body);
  return sendSuccess(res, 200, "Login successful", result);
});
