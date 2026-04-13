import { Op } from "sequelize";
import Inquiry from "../models/inquiryModel.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { validateInquiryPayload, validateInquiryStatus } from "../utils/validators.js";
import { resolveServiceLabel } from "./serviceService.js";

function normalizeInquiryPayload(payload = {}) {
  return {
    name: String(payload.name || "").trim(),
    phone: String(payload.phone || "").replace(/\D/g, "").slice(-10),
    service: String(payload.service || "").trim(),
    client_email: String(payload.client_email || "").trim(),
    status: String(payload.status || "new").trim().toLowerCase() || "new",
  };
}

export async function createInquiry(payload) {
  const normalizedPayload = normalizeInquiryPayload(payload);
  validateInquiryPayload(normalizedPayload);
  normalizedPayload.service = await resolveServiceLabel(normalizedPayload.service);
  normalizedPayload.status = "new";

  const recentDuplicate = await Inquiry.findOne({
    where: {
      phone: normalizedPayload.phone,
      service: normalizedPayload.service,
      created_at: {
        [Op.gte]: new Date(Date.now() - 60 * 1000),
      },
    },
  });

  if (recentDuplicate) {
    throw new ApiError(429, "Please wait a moment before submitting the same inquiry again");
  }

  return Inquiry.create(normalizedPayload);
}

export async function listInquiries(query = {}) {
  const search = String(query.search || "").trim();
  const status = String(query.status || "").trim().toLowerCase();
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(500, Math.max(1, Number(query.limit) || 100));
  const offset = (page - 1) * limit;
  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status) {
    validateInquiryStatus(status);
    where.status = status;
  }

  const { count, rows } = await Inquiry.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return {
    rows,
    pagination: {
      page,
      limit,
      total: count,
    },
  };
}

export async function updateInquiryStatus(id, status) {
  validateInquiryStatus(status);
  const inquiry = await Inquiry.findByPk(id);

  if (!inquiry) {
    throw new ApiError(404, "Inquiry not found");
  }

  await inquiry.update({
    status: String(status).trim().toLowerCase(),
  });

  return inquiry;
}
