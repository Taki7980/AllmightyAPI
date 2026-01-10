import express from 'express';
import {
  fetchAllUsers,
  fetchUserById,
  updateUserById,
  deleteUserById,
} from '#controllers/user.controller.js';
import { authenticate } from '#middleware/auth.middleware.js';

export const UserRouter = express.Router();

// Apply authentication middleware to all user routes
UserRouter.use(authenticate);

UserRouter.get('/', fetchAllUsers);
UserRouter.get('/:id', fetchUserById);
UserRouter.put('/:id', updateUserById);
UserRouter.delete('/:id', deleteUserById);
