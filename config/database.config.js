import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import envconfig from "./enviormentconfig.js"; 

dotenv.config(); 


export const sequelize = new Sequelize(
  envconfig.db.name,
  envconfig.db.user,
  envconfig.db.password,
  {
    host: envconfig.db.host,
    dialect: "mysql",
    logging: false,
  }
);
