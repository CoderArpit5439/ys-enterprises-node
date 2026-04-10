import bcrypt from "bcryptjs";
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.config.js";
import envconfig from "../config/enviormentconfig.js";

const Admin = sequelize.define(
  "Admin",
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "admin",
    },
  },
  {
    tableName: envconfig.tables.admin,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      async beforeCreate(admin) {
        admin.password = await bcrypt.hash(admin.password, 10);
      },
      async beforeUpdate(admin) {
        if (admin.changed("password")) {
          admin.password = await bcrypt.hash(admin.password, 10);
        }
      },
    },
    defaultScope: {
      attributes: {
        exclude: ["password"],
      },
    },
    scopes: {
      withPassword: {
        attributes: {
          include: ["password"],
        },
      },
    },
  }
);

export default Admin;
