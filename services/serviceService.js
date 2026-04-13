import { Op } from "sequelize";
import Service from "../models/serviceModel.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { validateServicePayload } from "../utils/validators.js";

const defaultServices = [
  {
    name: "ITR Filing",
    slug: "itr-filing",
    price: 1200,
    details:
      "Professional income tax return filing support for salaried individuals, freelancers, business owners, and firms with expert review and filing assistance.",
    meta_description:
      "ITR filing services by YS Concern with expert support, tax review, and fast online filing across India.",
  },
  {
    name: "GST Registration",
    slug: "gst-registration",
    price: 1999,
    details:
      "End-to-end GST registration assistance including document review, application filing, and onboarding support for businesses across India.",
    meta_description:
      "GST registration service with documentation, filing, and expert compliance support from YS Concern.",
  },
  {
    name: "GST Filing",
    slug: "gst-filing",
    price: 1500,
    details:
      "Monthly and quarterly GST return filing with reconciliation, compliance guidance, and practical support for notices or mismatches.",
    meta_description:
      "GST filing services for businesses with monthly and quarterly compliance support from YS Concern.",
  },
  {
    name: "Company Registration",
    slug: "company-registration",
    price: 3999,
    details:
      "Private limited company registration support including name reservation, documentation, incorporation filing, and post-registration guidance.",
    meta_description:
      "Company registration service for startups and businesses with expert incorporation support.",
  },
  {
    name: "LLP Registration",
    slug: "llp-registration",
    price: 3500,
    details:
      "LLP registration support with partner documentation, incorporation filing, and practical guidance for compliant setup.",
    meta_description:
      "LLP registration services with expert support for documentation and filing.",
  },
  {
    name: "Accounting & Bookkeeping",
    slug: "accounting-bookkeeping",
    price: 2800,
    details:
      "Reliable accounting and bookkeeping services for businesses, including ledgers, reconciliations, reporting, and regular compliance support.",
    meta_description:
      "Accounting and bookkeeping services with structured financial records and reporting support.",
  },
];

export async function seedDefaultServices() {
  const count = await Service.count();

  if (count > 0) {
    return;
  }

  await Service.bulkCreate(defaultServices);
}

export async function listPublicServices() {
  return Service.findAll({
    where: { is_active: true },
    attributes: [
      "id",
      "name",
      "slug",
      "price",
      "details",
      "image_url",
      "meta_description",
      "created_at",
      "updated_at",
    ],
    order: [["name", "ASC"]],
  });
}

function slugifyServiceName(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);
}

function normalizeServicePayload(payload = {}) {
  const normalizedName = String(payload.name || "").trim();

  return {
    name: normalizedName,
    slug: String(payload.slug || slugifyServiceName(normalizedName)).trim().toLowerCase(),
    price:
      payload.price === undefined || payload.price === null || String(payload.price).trim() === ""
        ? null
        : Number(payload.price),
    details: String(payload.details || "").trim(),
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

async function ensureUniqueServiceSlug(slug, excludeId = null) {
  const existing = await Service.findOne({
    where: excludeId ? { slug, id: { [Op.ne]: excludeId } } : { slug },
  });

  if (existing) {
    throw new ApiError(400, "A service with this slug already exists");
  }
}

export async function listAdminServices() {
  return Service.findAll({
    order: [["updated_at", "DESC"]],
  });
}

export async function getPublicServiceBySlug(slug) {
  const service = await Service.findOne({
    where: {
      slug: String(slug || "").trim().toLowerCase(),
      is_active: true,
    },
  });

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  return service;
}

export async function createService(payload) {
  const normalizedPayload = normalizeServicePayload(payload);
  validateServicePayload(normalizedPayload);

  if (!normalizedPayload.slug) {
    throw new ApiError(400, "Slug could not be generated for this service");
  }

  await ensureUniqueServiceSlug(normalizedPayload.slug);
  return Service.create(normalizedPayload);
}

export async function updateService(id, payload) {
  const service = await Service.findByPk(id);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  const normalizedPayload = normalizeServicePayload({
    ...service.toJSON(),
    ...payload,
  });

  validateServicePayload(normalizedPayload, { isUpdate: true });

  if (!normalizedPayload.name) {
    throw new ApiError(400, "Service name is required");
  }

  if (!normalizedPayload.details) {
    throw new ApiError(400, "Service details are required");
  }

  if (!normalizedPayload.slug) {
    throw new ApiError(400, "Slug could not be generated for this service");
  }

  await ensureUniqueServiceSlug(normalizedPayload.slug, Number(id));
  await service.update(normalizedPayload);
  return service;
}

export async function deleteService(id) {
  const service = await Service.findByPk(id);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  await service.destroy();
}

export async function resolveServiceLabel(input) {
  const value = String(input || "").trim();

  if (!value) {
    throw new ApiError(400, "Service is required");
  }

  const normalized = value.toLowerCase();
  const service = await Service.findOne({
    where: {
      is_active: true,
      slug: normalized,
    },
  });

  if (service) {
    return service.name;
  }

  const matchingByName = await Service.findOne({
    where: {
      is_active: true,
      name: value,
    },
  });

  if (!matchingByName) {
    throw new ApiError(400, "Selected service is not available");
  }

  return matchingByName.name;
}
