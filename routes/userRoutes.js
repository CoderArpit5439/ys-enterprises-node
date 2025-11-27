import express from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  getClientByFileNo,
  updateClient,
  deleteClient,
  getClientStats
} from '../controllers/userController.js';

const router = express.Router();

// Client routes
router.post('/register-new-client', createClient);
router.get('/clients', getAllClients);
router.get('/clients/stats', getClientStats);
router.get('/clients/:id', getClientById);
router.get('/clients/file/:fileNo', getClientByFileNo);
router.put('/clients/:id', updateClient);
router.delete('/clients/:id', deleteClient);

export default router;