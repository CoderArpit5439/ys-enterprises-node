import dotenv from "dotenv";

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';


const envconfig = {
  env: process.env.NODE_ENV || "development",

  port: isProd ? process.env.PORT_PROD : process.env.PORT_DEV,

  db: {
    host: isProd ? process.env.DB_HOST_PROD : process.env.DB_HOST_DEV,
    user: isProd ? process.env.DB_USER_PROD : process.env.DB_USER_DEV,
    password: isProd ? process.env.DB_PASSWORD_PROD : process.env.DB_PASSWORD_DEV,
    name: isProd ? process.env.DB_NAME_PROD : process.env.DB_NAME_DEV,
    secName: isProd ? process.env.MY_FARM_DB : process.env.MY_FARM_DB,
  },

  jwtSecret: process.env.JWT_SECRET,

//   email: {
//     host: isProd ? process.env.SMTP_HOST_PROD : process.env.SMTP_HOST,
//     port: isProd ? process.env.SMTP_PORT_PROD : process.env.SMTP_PORT,
//     user: isProd ? process.env.SMTP_USER_PROD : process.env.SMTP_USER,
//     pass: isProd ? process.env.SMTP_PASS_PROD : process.env.SMTP_PASS,
//     fromName: "",
//   },
};

export default envconfig;
