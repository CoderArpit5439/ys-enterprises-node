import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
import envconfig from "../config/enviormentconfig.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

function formatAdminPayload(admin) {
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}

export async function createAdmin({ name, email, password }) {
  const existingAdmin = await Admin.unscoped().findOne({
    where: { email },
  });

  if (existingAdmin) {
    throw new ApiError(409, "Admin email already exists");
  }

  const admin = await Admin.create({
    name,
    email,
    password,
  });

  return formatAdminPayload(admin);
}

export async function loginAdmin({ email, password }) {
  const admin = await Admin.scope("withPassword").findOne({
    where: { email },
  });

  if (!admin?.password) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    {
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    },
    envconfig.jwtSecret,
    {
      expiresIn: envconfig.jwtExpiresIn,
    }
  );

  return {
    token,
    admin: formatAdminPayload(admin),
  };
}
