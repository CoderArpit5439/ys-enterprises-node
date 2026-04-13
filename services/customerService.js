import { Op } from "sequelize";
import Customer from "../models/customerModel.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { validateCustomerPayload } from "../utils/validators.js";
import { sequelize } from "../config/database.config.js";

async function getCustomerTableColumns() {
  const tableName = Customer.getTableName();
  const queryInterface = sequelize.getQueryInterface();
  return queryInterface.describeTable(tableName);
}

async function getSelectableCustomerAttributes() {
  const existingColumns = await getCustomerTableColumns();

  return Object.entries(Customer.rawAttributes)
    .filter(([, attribute]) => Boolean(existingColumns[attribute.field || attribute.fieldName]))
    .map(([attributeName]) => attributeName);
}

async function filterPayloadToExistingCustomerColumns(payload = {}) {
  const existingColumns = await getCustomerTableColumns();

  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => {
      const attribute = Customer.rawAttributes[key];

      if (!attribute) {
        return false;
      }

      return Boolean(existingColumns[attribute.field || attribute.fieldName]);
    })
  );
}

function trimValueToColumnDefinition(value, columnDefinition) {
  if (value === undefined || value === null || typeof value !== "string" || !columnDefinition?.type) {
    return value;
  }

  const columnType = String(columnDefinition.type).toUpperCase();
  const varcharMatch = columnType.match(/(?:VAR)?CHAR\((\d+)\)/);

  if (varcharMatch) {
    return value.slice(0, Number(varcharMatch[1]));
  }

  const enumMatch = columnType.match(/^ENUM\((.*)\)$/);

  if (enumMatch) {
    const allowedValues = Array.from(enumMatch[1].matchAll(/'((?:\\'|[^'])*)'/g)).map((match) =>
      match[1].replace(/\\'/g, "'")
    );

    if (!allowedValues.includes(value)) {
      return columnDefinition.allowNull ? null : allowedValues[0] || value;
    }
  }

  return value;
}

async function alignPayloadToCustomerSchema(payload = {}) {
  const existingColumns = await getCustomerTableColumns();
  const filteredPayload = await filterPayloadToExistingCustomerColumns(payload);

  return Object.fromEntries(
    Object.entries(filteredPayload).map(([key, value]) => {
      const attribute = Customer.rawAttributes[key];
      const columnDefinition = existingColumns[attribute?.field || attribute?.fieldName];
      return [key, trimValueToColumnDefinition(value, columnDefinition)];
    })
  );
}

function normalizeCustomerPayload(payload = {}) {
  const normalized = { ...payload };

  Object.keys(normalized).forEach((key) => {
    if (typeof normalized[key] === "string") {
      normalized[key] = normalized[key].trim();
    }
  });

  if (normalized.pan_no) {
    normalized.pan_no = String(normalized.pan_no)
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
  }

  if (normalized.adhaar_number) {
    normalized.adhaar_number = String(normalized.adhaar_number).replace(/\D/g, "");
  }

  if (normalized.contact) {
    normalized.contact = String(normalized.contact).replace(/\D/g, "");
  }

  if (normalized.pin_code) {
    normalized.pin_code = String(normalized.pin_code).replace(/\D/g, "");
  }

  if (normalized.date_of_birth === "") {
    normalized.date_of_birth = null;
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

  const attributes = [...new Set(uniqueChecks.map(({ key }) => key))];
  const existingCustomers = await Customer.findAll({ where, attributes });

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

function getDuplicateLabelsForRows(rows = []) {
  const uniqueChecks = [
    { key: "file_no", label: "File number" },
    { key: "pan_no", label: "PAN number" },
  ];

  const seen = new Map();
  const duplicates = [];

  rows.forEach((row, index) => {
    uniqueChecks.forEach(({ key, label }) => {
      const value = row[key];

      if (!value) {
        return;
      }

      const mapKey = `${key}:${value}`;

      if (seen.has(mapKey)) {
        duplicates.push({
          row: index + 2,
          field: label,
          value,
          conflictsWithRow: seen.get(mapKey),
        });
        return;
      }

      seen.set(mapKey, index + 2);
    });
  });

  return duplicates;
}

async function ensureUniqueCustomerFieldsForBulk(rows) {
  const duplicateRows = getDuplicateLabelsForRows(rows);

  if (duplicateRows.length > 0) {
    throw new ApiError(409, "Duplicate values found in uploaded file", {
      duplicateRows,
    });
  }

  const uniqueChecks = [
    { key: "file_no", label: "File number" },
    { key: "pan_no", label: "PAN number" },
  ];

  const where = {
    [Op.or]: uniqueChecks
      .flatMap(({ key }) => [...new Set(rows.map((row) => row[key]).filter(Boolean))].map((value) => ({ [key]: value }))),
  };

  if (where[Op.or].length === 0) {
    return;
  }

  const attributes = [...new Set(uniqueChecks.map(({ key }) => key))];
  const existingCustomers = await Customer.findAll({ where, attributes });

  if (existingCustomers.length === 0) {
    return;
  }

  const duplicateFields = [];

  rows.forEach((row, index) => {
    uniqueChecks.forEach(({ key, label }) => {
      if (row[key] && existingCustomers.some((customer) => customer[key] === row[key])) {
        duplicateFields.push({
          row: index + 2,
          field: label,
          value: row[key],
        });
      }
    });
  });

  throw new ApiError(409, "Uploaded file contains values that already exist", {
    duplicateFields,
  });
}

export async function createCustomer(payload) {
  const normalizedPayload = normalizeCustomerPayload(payload);
  validateCustomerPayload(normalizedPayload);
  await ensureUniqueCustomerFields(normalizedPayload);
  const safePayload = await alignPayloadToCustomerSchema(normalizedPayload);
  const customer = await Customer.create(safePayload);
  return getCustomerById(customer.id);
}

export async function createCustomersBulk(payloadRows = []) {
  if (!Array.isArray(payloadRows) || payloadRows.length === 0) {
    throw new ApiError(400, "Upload file must contain at least one customer row");
  }

  const normalizedRows = payloadRows.map((row, index) => {
    const normalizedRow = normalizeCustomerPayload(row);

    try {
      validateCustomerPayload(normalizedRow, { skipFormatValidation: true });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new ApiError(error.statusCode, `Row ${index + 2}: ${error.message}`, error.details);
      }

      throw error;
    }

    return normalizedRow;
  });

  await ensureUniqueCustomerFieldsForBulk(normalizedRows);

  const safeRows = await Promise.all(
    normalizedRows.map((row) => alignPayloadToCustomerSchema(row))
  );

  const createdCustomers = await sequelize.transaction(async (transaction) =>
    Customer.bulkCreate(safeRows, { transaction })
  );

  return {
    insertedCount: createdCustomers.length,
    customers: await Promise.all(createdCustomers.map((customer) => getCustomerById(customer.id))),
  };
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

  const attributes = await getSelectableCustomerAttributes();

  const { count, rows } = await Customer.findAndCountAll({
    where,
    limit,
    offset,
    attributes,
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
  const attributes = await getSelectableCustomerAttributes();
  const customer = await Customer.findByPk(id, { attributes });

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
  const safePayload = await alignPayloadToCustomerSchema(normalizedPayload);
  await customer.update(safePayload);
  return getCustomerById(id);
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
