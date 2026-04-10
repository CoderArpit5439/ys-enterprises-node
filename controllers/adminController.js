import { loginAdmin } from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { validateAdminLoginPayload } from "../utils/validators.js";

export const adminLogin = asyncHandler(async (req, res) => {
  validateAdminLoginPayload(req.body);
  const result = await loginAdmin(req.body);
  return sendSuccess(res, 200, "Login successful", result);
});
