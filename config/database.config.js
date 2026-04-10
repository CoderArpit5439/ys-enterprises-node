import { Sequelize } from "sequelize";
import envconfig from "./enviormentconfig.js";

export const sequelize = new Sequelize(envconfig.db.name, envconfig.db.user, envconfig.db.password, {
  host: envconfig.db.host,
  dialect: "mysql",
  logging: false,
  define: {
    freezeTableName: true,
  },
});
