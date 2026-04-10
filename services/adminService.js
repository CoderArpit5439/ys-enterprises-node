import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { QueryTypes } from "sequelize";
import envconfig from "../config/enviormentconfig.js";
import { sequelize } from "../config/database.config.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

function normalizeAdminRow(admin) {
  if (!admin) {
    return null;
  }

  return {
    id: admin.id,
    name: admin.name || admin.full_name || admin.username || "Admin",
    email: admin.email,
    role: admin.role || "admin",
    passwordHash: admin.password_hash || admin.password,
  };
}

export async function loginAdmin({ email, password }) {
  const [adminRow] = await sequelize.query(
    `SELECT * FROM ${envconfig.tables.admin} WHERE email = :email LIMIT 1`,
    {
      replacements: { email },
      type: QueryTypes.SELECT,
    }
  );

  const admin = normalizeAdminRow(adminRow);

  if (!admin?.passwordHash) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

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
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
}
