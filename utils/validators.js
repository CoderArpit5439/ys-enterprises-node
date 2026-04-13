import { ApiError } from "../middlewares/errorMiddleware.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const aadhaarRegex = /^[0-9]{12}$/;
const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6-9]\d{9}$/;
const inquiryStatusValues = ["new", "contacted", "converted", "closed"];

export function validateRequiredFields(payload, requiredFields) {
  const missingFields = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === "";
  });

  if (missingFields.length > 0) {
    throw new ApiError(400, "Validation failed", {
      missingFields,
    });
  }
}

export function validateAdminLoginPayload(payload) {
  validateRequiredFields(payload, ["email", "password"]);

  if (!emailRegex.test(String(payload.email).trim())) {
    throw new ApiError(400, "Please provide a valid email address");
  }
}

export function validateAdminCreatePayload(payload) {
  validateRequiredFields(payload, ["name", "email", "password"]);

  if (!emailRegex.test(String(payload.email).trim())) {
    throw new ApiError(400, "Please provide a valid email address");
  }

  if (String(payload.password).trim().length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }
}

export function validateCustomerPayload(
  payload,
  { isUpdate = false, skipFormatValidation = false } = {}
) {
  if (!isUpdate) {
    validateRequiredFields(payload, ["file_no", "client_name"]);
  }

  if (skipFormatValidation) {
    return;
  }

  if (payload.pan_no && !panRegex.test(String(payload.pan_no).trim().toUpperCase())) {
    throw new ApiError(400, "PAN number must be in valid format");
  }

  if (payload.adhaar_number && !aadhaarRegex.test(String(payload.adhaar_number).trim())) {
    throw new ApiError(400, "Aadhaar number must be 12 digits");
  }

  if (payload.contact && !phoneRegex.test(String(payload.contact).replace(/\s/g, ""))) {
    throw new ApiError(400, "Contact number must be a valid Indian mobile number");
  }
}

export function validateWorkDiaryPayload(payload) {
  validateRequiredFields(payload, ["entry_type", "client_name", "financial_year", "status", "amount"]);

  if (!["direct", "commission"].includes(String(payload.entry_type).trim().toLowerCase())) {
    throw new ApiError(400, "entry_type must be either direct or commission");
  }

  if (Number.isNaN(Number(payload.amount))) {
    throw new ApiError(400, "Amount must be numeric");
  }
}

export function validateInquiryPayload(payload) {
  validateRequiredFields(payload, ["name", "phone", "service"]);

  if (!phoneRegex.test(String(payload.phone).replace(/\s/g, ""))) {
    throw new ApiError(400, "Phone number must be a valid 10-digit mobile number");
  }

  if (payload.client_email && !emailRegex.test(String(payload.client_email).trim())) {
    throw new ApiError(400, "Please provide a valid email address");
  }
}

export function validateInquiryStatus(status) {
  if (!inquiryStatusValues.includes(String(status || "").trim().toLowerCase())) {
    throw new ApiError(400, "Status must be one of new, contacted, converted, or closed");
  }
}

export function validateServicePayload(payload, { isUpdate = false } = {}) {
  if (!isUpdate) {
    validateRequiredFields(payload, ["name", "details"]);
  }

  if (payload.price !== undefined && payload.price !== null && String(payload.price).trim() !== "") {
    if (Number.isNaN(Number(payload.price)) || Number(payload.price) < 0) {
      throw new ApiError(400, "Price must be a valid positive number");
    }
  }

  if (payload.image_url && !/^https?:\/\//i.test(String(payload.image_url).trim())) {
    throw new ApiError(400, "Image URL must start with http:// or https://");
  }
}
