import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.config.js";
import envconfig from "../config/enviormentconfig.js";

const WorkDiaryEntry = sequelize.define(
  "WorkDiaryEntry",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    serial_no: DataTypes.INTEGER,
    entry_type: DataTypes.ENUM("direct", "commission"),
    client_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    contact_details: DataTypes.STRING(255),
    person_in_contact: DataTypes.STRING(255),
    financial_year: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    assessment_year: DataTypes.STRING(20),
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    tableName: envconfig.tables.workDiary,
    timestamps: false,
  }
);

export default WorkDiaryEntry;
