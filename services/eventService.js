import { Op } from "sequelize";
import Event from "../models/eventModel.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { validateEventPayload } from "../utils/validators.js";

const defaultEvents = [
  {
    title: "Last Date for ITR Filing FY 2023-24",
    slug: "last-date-for-itr-filing-fy-2023-24",
    description: "File your income tax returns before the deadline to avoid penalties.",
    event_date: "2025-07-31",
    event_type: "Deadline",
    meta_description: "Important ITR filing deadline and reminders from YS Concern.",
  },
  {
    title: "GST Return Filing - January 2025",
    slug: "gst-return-filing-january-2025",
    description: "Monthly GST return filing deadline for January 2025.",
    event_date: "2025-02-20",
    event_type: "Deadline",
    meta_description: "Track GST filing deadlines with YS Concern event updates.",
  },
  {
    title: "Free Tax Planning Workshop",
    slug: "free-tax-planning-workshop",
    description: "Join our workshop on tax planning and investment strategies for FY 2024-25.",
    event_date: "2025-02-28",
    event_type: "Event",
    meta_description: "Tax planning workshop and event registration updates from YS Concern.",
  },
];

function slugifyEventTitle(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

function normalizeEventPayload(payload = {}) {
  const normalizedTitle = String(payload.title || "").trim();

  return {
    title: normalizedTitle,
    slug: String(payload.slug || slugifyEventTitle(normalizedTitle)).trim().toLowerCase(),
    description: String(payload.description || "").trim(),
    event_date: String(payload.event_date || "").trim(),
    event_type: String(payload.event_type || "").trim() || "Deadline",
    image_url: String(payload.image_url || "").trim(),
    meta_description: String(payload.meta_description || "").trim(),
    is_active:
      payload.is_active === undefined
        ? true
        : payload.is_active === true ||
          payload.is_active === "true" ||
          payload.is_active === 1 ||
          payload.is_active === "1",
  };
}

async function ensureUniqueEventSlug(slug, excludeId = null) {
  const existing = await Event.findOne({
    where: excludeId ? { slug, id: { [Op.ne]: excludeId } } : { slug },
  });

  if (existing) {
    throw new ApiError(400, "An event with this slug already exists");
  }
}

export async function seedDefaultEvents() {
  const count = await Event.count();

  if (count > 0) {
    return;
  }

  await Event.bulkCreate(defaultEvents);
}

export async function listPublicEvents() {
  return Event.findAll({
    where: { is_active: true },
    order: [
      ["event_date", "ASC"],
      ["id", "DESC"],
    ],
  });
}

export async function listAdminEvents() {
  return Event.findAll({
    order: [
      ["event_date", "ASC"],
      ["updated_at", "DESC"],
    ],
  });
}

export async function createEvent(payload) {
  const normalizedPayload = normalizeEventPayload(payload);
  validateEventPayload(normalizedPayload);

  if (!normalizedPayload.slug) {
    throw new ApiError(400, "Slug could not be generated for this event");
  }

  await ensureUniqueEventSlug(normalizedPayload.slug);
  return Event.create(normalizedPayload);
}

export async function updateEvent(id, payload) {
  const event = await Event.findByPk(id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const normalizedPayload = normalizeEventPayload({
    ...event.toJSON(),
    ...payload,
  });

  validateEventPayload(normalizedPayload, { isUpdate: true });

  if (!normalizedPayload.title) {
    throw new ApiError(400, "Event title is required");
  }

  if (!normalizedPayload.description) {
    throw new ApiError(400, "Event description is required");
  }

  if (!normalizedPayload.event_date) {
    throw new ApiError(400, "Event date is required");
  }

  if (!normalizedPayload.slug) {
    throw new ApiError(400, "Slug could not be generated for this event");
  }

  await ensureUniqueEventSlug(normalizedPayload.slug, Number(id));
  await event.update(normalizedPayload);
  return event;
}

export async function deleteEvent(id) {
  const event = await Event.findByPk(id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  await event.destroy();
}
