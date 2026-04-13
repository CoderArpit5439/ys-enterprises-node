import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import {
  createEvent,
  deleteEvent,
  listAdminEvents,
  listPublicEvents,
  updateEvent,
} from "../services/eventService.js";

export const listEventsController = asyncHandler(async (req, res) => {
  const events = await listPublicEvents();
  return sendSuccess(res, 200, "Events fetched successfully", events);
});

export const listAdminEventsController = asyncHandler(async (req, res) => {
  const events = await listAdminEvents();
  return sendSuccess(res, 200, "Admin events fetched successfully", events);
});

export const createEventController = asyncHandler(async (req, res) => {
  const event = await createEvent(req.body);
  return sendSuccess(res, 201, "Event created successfully", event);
});

export const updateEventController = asyncHandler(async (req, res) => {
  const event = await updateEvent(req.params.id, req.body);
  return sendSuccess(res, 200, "Event updated successfully", event);
});

export const deleteEventController = asyncHandler(async (req, res) => {
  await deleteEvent(req.params.id);
  return sendSuccess(res, 200, "Event deleted successfully");
});
