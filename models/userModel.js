import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.config.js";

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  file_no: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  client_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  family: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  father_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pan_no: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [10, 10]
    }
  },
  adhaar_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [12, 12]
    }
  },
  contact: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  citizenship: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pin_code: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    defaultValue: 'active'
  },
  area: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  assessment_year: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  allotted_by: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  allotted_to: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  pending: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  done: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  important: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  notice_information: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'clients',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['file_no']
    },
    {
      fields: ['client_name']
    },
    {
      fields: ['pan_no']
    },
    {
      fields: ['adhaar_number']
    },
    {
      fields: ['status']
    }
  ]
});

Client.sync({ alter: true }).then(() => {
  console.log('Client table synced successfully');
}).catch(error => {
  console.error('Error syncing Client table:', error);
});

export default Client;