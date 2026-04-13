import { Op } from "sequelize";
import WorkDiaryEntry from "../models/workDiaryModel.js";
import { sequelize } from "../config/database.config.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { validateWorkDiaryPayload } from "../utils/validators.js";

function normalizeDiaryPayload(payload = {}) {
  return {
    ...payload,
    serial_no:
      payload.serial_no === undefined || payload.serial_no === null || String(payload.serial_no).trim() === ""
        ? null
        : Number(payload.serial_no),
    entry_type: payload.entry_type ? String(payload.entry_type).trim().toLowerCase() : payload.entry_type,
    client_name: payload.client_name ? String(payload.client_name).trim() : payload.client_name,
    contact_details: payload.contact_details ? String(payload.contact_details).trim() : payload.contact_details,
    person_in_contact: payload.person_in_contact
      ? String(payload.person_in_contact).trim()
      : payload.person_in_contact,
    financial_year: payload.financial_year ? String(payload.financial_year).trim() : payload.financial_year,
    assessment_year: payload.assessment_year ? String(payload.assessment_year).trim() : payload.assessment_year,
    status: payload.status ? String(payload.status).trim() : payload.status,
    amount:
      payload.amount === undefined || payload.amount === null || String(payload.amount).trim() === ""
        ? payload.amount
        : Number(payload.amount),
  };
}

export async function createWorkDiaryEntry(payload) {
  const normalizedPayload = normalizeDiaryPayload(payload);
  validateWorkDiaryPayload(normalizedPayload);
  return WorkDiaryEntry.create(normalizedPayload);
}

export async function createWorkDiaryEntriesBulk(rows = []) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new ApiError(400, "Please provide at least one work diary row");
  }

  const normalizedRows = rows.map((row, index) => {
    try {
      const normalizedRow = normalizeDiaryPayload(row);
      validateWorkDiaryPayload(normalizedRow);
      return normalizedRow;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new ApiError(400, `Row ${index + 1}: ${error.message}`, error.details);
      }

      throw error;
    }
  });

  return sequelize.transaction(async (transaction) => {
    const entries = await WorkDiaryEntry.bulkCreate(normalizedRows, {
      transaction,
    });

    return {
      entries,
      insertedCount: entries.length,
    };
  });
}

export async function listWorkDiaryEntries(query) {
  const search = String(query.search || "").trim();
  const financialYear = String(query.financial_year || "").trim();
  const assessmentYear = String(query.assessment_year || "").trim();
  const where = {};

  if (search) {
    where[Op.or] = [
      { client_name: { [Op.like]: `%${search}%` } },
      { contact_details: { [Op.like]: `%${search}%` } },
      { person_in_contact: { [Op.like]: `%${search}%` } },
    ];
  }

  if (financialYear) {
    where.financial_year = financialYear;
  }

  if (assessmentYear) {
    where.assessment_year = assessmentYear;
  }

  const rows = await WorkDiaryEntry.findAll({
    where,
    order: [
      ["entry_type", "ASC"],
      ["serial_no", "ASC"],
      ["id", "ASC"],
    ],
  });

  return {
    directClients: rows.filter((row) => row.entry_type === "direct"),
    commissionClients: rows.filter((row) => row.entry_type === "commission"),
  };
}

export async function getWorkDiaryEntryById(id) {
  const entry = await WorkDiaryEntry.findByPk(id);

  if (!entry) {
    throw new ApiError(404, "Work diary entry not found");
  }

  return entry;
}

export async function updateWorkDiaryEntry(id, payload) {
  const entry = await getWorkDiaryEntryById(id);
  const normalizedPayload = normalizeDiaryPayload(payload);
  validateWorkDiaryPayload({
    ...entry.toJSON(),
    ...normalizedPayload,
  });
  await entry.update(normalizedPayload);
  return entry;
}

export async function deleteWorkDiaryEntry(id) {
  const entry = await getWorkDiaryEntryById(id);
  await entry.destroy();
}
