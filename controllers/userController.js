import Client from "../models/userModel.js";
import { Op } from "sequelize";

// Create new client
export const createClient = async (req, res) => {
  try {
    const clientData = req.body;
    const { file_no, contact, adhaar_number, pan_no } = clientData;
    
    // Create conditions for duplicate check
    const whereConditions = [];
    
    if (file_no) whereConditions.push({ file_no });
    if (contact) whereConditions.push({ contact });
    if (adhaar_number) whereConditions.push({ adhaar_number });
    if (pan_no) whereConditions.push({ pan_no });
    
    // Check for any existing records with the same unique fields
    if (whereConditions.length > 0) {
      const existingClients = await Client.findAll({
        where: {
          [Op.or]: whereConditions
        }
      });
      
      if (existingClients.length > 0) {
        const duplicateFields = [];
        
        existingClients.forEach(client => {
          if (client.file_no === file_no) duplicateFields.push('File number');
          if (client.contact === contact) duplicateFields.push('Contact number');
          if (client.adhaar_number === adhaar_number) duplicateFields.push('Aadhaar number');
          if (client.pan_no === pan_no) duplicateFields.push('PAN number');
        });
        
        return res.status(400).json({
          success: false,
          message: `Duplicate values found: ${duplicateFields.join(', ')}`,
          duplicateFields: duplicateFields
        });
      }
    }
    
    const client = await Client.create(clientData);
    
    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating client',
      error: error.message
    });
  }
};

// Get all clients with pagination and filtering
export const getAllClients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;
    const whereCondition = {};
    
    // Add search filter
    if (search) {
      whereCondition[Op.or] = [
        { client_name: { [Op.like]: `%${search}%` } },
        { file_no: { [Op.like]: `%${search}%` } },
        { pan_no: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Add status filter
    if (status) {
      whereCondition.status = status;
    }
    
    const { count, rows } = await Client.findAndCountAll({
      where: whereCondition,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message
    });
  }
};

// Get client by ID
export const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message
    });
  }
};

// Get client by file number
export const getClientByFileNo = async (req, res) => {
  try {
    const { fileNo } = req.params;
    
    const client = await Client.findOne({
      where: { file_no: fileNo }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message
    });
  }
};

// Update client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // If file_no is being updated, check for duplicates
    if (updateData.file_no && updateData.file_no !== client.file_no) {
      const existingClient = await Client.findOne({
        where: { file_no: updateData.file_no }
      });
      
      if (existingClient) {
        return res.status(400).json({
          success: false,
          message: 'File number already exists'
        });
      }
    }
    
    await client.update(updateData);
    
    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating client',
      error: error.message
    });
  }
};

// Delete client
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findByPk(id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    await client.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting client',
      error: error.message
    });
  }
};

// Get client statistics
export const getClientStats = async (req, res) => {
  try {
    const totalClients = await Client.count();
    const activeClients = await Client.count({ where: { status: 'active' } });
    const inactiveClients = await Client.count({ where: { status: 'inactive' } });
    const pendingClients = await Client.count({ where: { status: 'pending' } });
    
    res.status(200).json({
      success: true,
      data: {
        totalClients,
        activeClients,
        inactiveClients,
        pendingClients
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};