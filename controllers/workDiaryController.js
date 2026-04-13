import {
  createWorkDiaryEntry,
  createWorkDiaryEntriesBulk,
  deleteWorkDiaryEntry,
  getWorkDiaryEntryById,
  listWorkDiaryEntries,
  updateWorkDiaryEntry,
} from "../services/workDiaryService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const createWorkDiaryController = asyncHandler(async (req, res) => {
  const entry = await createWorkDiaryEntry(req.body);
  return sendSuccess(res, 201, "Work diary entry created successfully", entry);
});

export const createWorkDiaryBulkController = asyncHandler(async (req, res) => {
  const { rows = [] } = req.body || {};
  const result = await createWorkDiaryEntriesBulk(rows);

  return sendSuccess(
    res,
    201,
    "Work diary uploaded successfully",
    result.entries,
    { insertedCount: result.insertedCount }
  );
});

export const listWorkDiaryController = asyncHandler(async (req, res) => {
  const diary = await listWorkDiaryEntries(req.query);
  return sendSuccess(res, 200, "Work diary fetched successfully", diary);
});

export const getWorkDiaryByIdController = asyncHandler(async (req, res) => {
  const entry = await getWorkDiaryEntryById(req.params.id);
  return sendSuccess(res, 200, "Work diary entry fetched successfully", entry);
});

export const updateWorkDiaryController = asyncHandler(async (req, res) => {
  const entry = await updateWorkDiaryEntry(req.params.id, req.body);
  return sendSuccess(res, 200, "Work diary entry updated successfully", entry);
});

export const deleteWorkDiaryController = asyncHandler(async (req, res) => {
  await deleteWorkDiaryEntry(req.params.id);
  return sendSuccess(res, 200, "Work diary entry deleted successfully");
});
