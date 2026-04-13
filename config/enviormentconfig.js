import dotenv from "dotenv";

dotenv.config();

const currentEnv = (process.env.NODE_ENV || "development").trim().toLowerCase();
const isProd = currentEnv === "production";

function readEnv(key, fallback = "") {
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : fallback;
}

function readList(value, fallback = "*") {
  const source = value || fallback;

  if (source === "*") {
    return "*";
  }

  return source
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const envconfig = {
  env: currentEnv,
  isProd,
  port: Number(isProd ? readEnv("PORT_PROD", "5000") : readEnv("PORT_DEV", "5000")),
  jwtSecret: readEnv("JWT_SECRET"),
  jwtExpiresIn: readEnv("JWT_EXPIRES_IN", "1d"),
  corsOrigins: readList(readEnv("CORS_ORIGINS", "*")),
  frontendUrl: readEnv("FRONTEND_URL", "http://localhost:3000"),
  db: {
    host: isProd ? readEnv("DB_HOST_PROD") : readEnv("DB_HOST_DEV"),
    user: isProd ? readEnv("DB_USER_PROD") : readEnv("DB_USER_DEV"),
    password: isProd ? readEnv("DB_PASSWORD_PROD") : readEnv("DB_PASSWORD_DEV"),
    name: isProd ? readEnv("DB_NAME_PROD") : readEnv("DB_NAME_DEV"),
  },
  tables: {
    admin: readEnv("ADMIN_TABLE", "admin"),
    customers: readEnv("CUSTOMER_TABLE", "clients"),
    workDiary: readEnv("WORK_DIARY_TABLE", "work_diary_entries"),
    services: readEnv("SERVICES_TABLE", "services"),
    inquiries: readEnv("INQUIRIES_TABLE", "inquiries"),
  },
};

export default envconfig;
