import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.config.js";
import envconfig from "../config/enviormentconfig.js";

const Customer = sequelize.define(
  "Customer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    file_no: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    client_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    family: DataTypes.STRING(255),
    father_name: DataTypes.STRING(255),
    pan_no: DataTypes.STRING(20),
    adhaar_number: DataTypes.STRING(20),
    contact: DataTypes.STRING(15),
    date_of_birth: DataTypes.DATEONLY,
    citizenship: DataTypes.STRING(100),
    address: DataTypes.TEXT,
    pin_code: DataTypes.STRING(10),
    status: DataTypes.STRING(50),
    area: DataTypes.STRING(255),
    reference: {
      type: DataTypes.STRING(255),
      field: "reference",
    },
    assessment_year: DataTypes.STRING(20),
    allotted_by: DataTypes.STRING(255),
    allotted_to: DataTypes.STRING(255),
    pending: DataTypes.TEXT,
    done: DataTypes.TEXT,
    important: DataTypes.STRING(50),
    password: DataTypes.STRING(255),
    notice: {
      type: DataTypes.TEXT,
      field: "notice",
    },
  },
  {
    tableName: envconfig.tables.customers,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Customer;
