import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { createInquiry, deleteInquiry, listInquiries, updateInquiryStatus } from "../services/inquiryService.js";

export const createInquiryController = asyncHandler(async (req, res) => {
  const inquiry = await createInquiry(req.body);
  return sendSuccess(res, 201, "Inquiry submitted successfully", inquiry);
});

export const listInquiriesController = asyncHandler(async (req, res) => {
  const result = await listInquiries(req.query);
  return sendSuccess(res, 200, "Inquiries fetched successfully", result.rows, result.pagination);
});

export const updateInquiryStatusController = asyncHandler(async (req, res) => {
  const inquiry = await updateInquiryStatus(req.params.id, req.body?.status);
  return sendSuccess(res, 200, "Inquiry status updated successfully", inquiry);
});

export const deleteInquiryController = asyncHandler(async (req, res) => {
  await deleteInquiry(req.params.id);
  return sendSuccess(res, 200, "Inquiry deleted successfully");
});
