import { Op } from "sequelize";
import Customer from "../models/customerModel.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { validateCustomerPayload } from "../utils/validators.js";

function normalizeCustomerPayload(payload = {}) {
  const normalized = { ...payload };

  if (normalized.pan_no) {
    normalized.pan_no = String(normalized.pan_no).trim().toUpperCase();
  }

  if (normalized.adhaar_number) {
    normalized.adhaar_number = String(normalized.adhaar_number).trim();
  }

  if (normalized.file_no) {
    normalized.file_no = String(normalized.file_no).trim();
  }

  if (normalized.client_name) {
    normalized.client_name = String(normalized.client_name).trim();
  }

  return normalized;
}

async function ensureUniqueCustomerFields(payload, customerId = null) {
  const uniqueChecks = [
    { key: "file_no", label: "File number" },
    { key: "pan_no", label: "PAN number" },
    { key: "adhaar_number", label: "Aadhaar number" },
    { key: "contact", label: "Contact number" },
  ].filter(({ key }) => payload[key]);

  if (uniqueChecks.length === 0) {
    return;
  }

  const where = {
    [Op.or]: uniqueChecks.map(({ key }) => ({ [key]: payload[key] })),
  };

  if (customerId) {
    where.id = { [Op.ne]: customerId };
  }

  const existingCustomers = await Customer.findAll({ where });

  if (existingCustomers.length === 0) {
    return;
  }

  const duplicateFields = uniqueChecks
    .filter(({ key }) => existingCustomers.some((customer) => customer[key] === payload[key]))
    .map(({ label }) => label);

  throw new ApiError(409, "Duplicate customer values found", {
    duplicateFields,
  });
}

export async function createCustomer(payload) {
  const normalizedPayload = normalizeCustomerPayload(payload);
  validateCustomerPayload(normalizedPayload);
  await ensureUniqueCustomerFields(normalizedPayload);
  return Customer.create(normalizedPayload);
}

export async function listCustomers(query) {
  const allowedSortFields = [
    "id",
    "file_no",
    "client_name",
    "pan_no",
    "contact",
    "status",
    "area",
    "assessment_year",
    "allotted_to",
    "created_at",
    "updated_at",
  ];
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.max(Number(query.limit) || 10, 1);
  const search = String(query.search || "").trim();
  const status = String(query.status || "").trim();
  const area = String(query.area || "").trim();
  const requestedSortBy = String(query.sortBy || "created_at").trim();
  const sortBy = allowedSortFields.includes(requestedSortBy) ? requestedSortBy : "created_at";
  const sortOrder = String(query.sortOrder || "DESC").trim().toUpperCase() === "ASC" ? "ASC" : "DESC";
  const offset = (page - 1) * limit;

  const where = {};

  if (search) {
    where[Op.or] = [
      { client_name: { [Op.like]: `%${search}%` } },
      { file_no: { [Op.like]: `%${search}%` } },
      { pan_no: { [Op.like]: `%${search}%` } },
      { contact: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (area) {
    where.area = area;
  }

  const { count, rows } = await Customer.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sortBy, sortOrder]],
  });

  return {
    rows,
    meta: {
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit) || 1,
    },
  };
}

export async function getCustomerById(id) {
  const customer = await Customer.findByPk(id);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return customer;
}

export async function updateCustomer(id, payload) {
  const customer = await getCustomerById(id);
  const normalizedPayload = normalizeCustomerPayload(payload);
  validateCustomerPayload(normalizedPayload, { isUpdate: true });
  await ensureUniqueCustomerFields(normalizedPayload, id);
  await customer.update(normalizedPayload);
  return customer;
}

export async function deleteCustomer(id) {
  const customer = await getCustomerById(id);
  await customer.destroy();
}

export async function getCustomerStats() {
  const [totalCustomers, activeCustomers, pendingCustomers, completedCustomers] = await Promise.all([
    Customer.count(),
    Customer.count({ where: { status: "Active" } }),
    Customer.count({ where: { status: "Pending" } }),
    Customer.count({ where: { status: "Completed" } }),
  ]);

  return {
    totalCustomers,
    activeCustomers,
    pendingCustomers,
    completedCustomers,
  };
}
