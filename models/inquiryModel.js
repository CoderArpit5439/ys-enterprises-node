import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.config.js";
import envconfig from "../config/enviormentconfig.js";

const Inquiry = sequelize.define(
  "Inquiry",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    service: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    client_email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("new", "contacted", "converted", "closed"),
      allowNull: false,
      defaultValue: "new",
    },
  },
  {
    tableName: envconfig.tables.inquiries,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Inquiry;
