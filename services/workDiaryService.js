import { Op } from "sequelize";
import WorkDiaryEntry from "../models/workDiaryModel.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { validateWorkDiaryPayload } from "../utils/validators.js";

function normalizeDiaryPayload(payload = {}) {
  return {
    ...payload,
    entry_type: payload.entry_type ? String(payload.entry_type).trim().toLowerCase() : payload.entry_type,
    amount: payload.amount !== undefined ? Number(payload.amount) : payload.amount,
  };
}

export async function createWorkDiaryEntry(payload) {
  const normalizedPayload = normalizeDiaryPayload(payload);
  validateWorkDiaryPayload(normalizedPayload);
  return WorkDiaryEntry.create(normalizedPayload);
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
