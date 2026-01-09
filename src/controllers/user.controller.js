import logger from '#config/logger.js';
import {
  getAllUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from '#services/user.services.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/user.validations.js';
import { formatValidationErrors } from '#utils/format.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersService();
    return res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error('Error fetching users:', error);
    next(error);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { id } = validationResult.data;
    const user = await getUserByIdService(id);
    return res.json({
      message: 'Successfully retrieved user',
      user,
    });
  } catch (error) {
    logger.error(error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const paramValidation = userIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(paramValidation.error),
      });
    }

    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(bodyValidation.error),
      });
    }

    const { id } = paramValidation.data;
    const updates = bodyValidation.data;

    // users can only update their own profile unless they're admin
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own profile',
      });
    }

    // role changes require admin
    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can change user roles',
      });
    }
    const updatedUser = await updateUserService(id, updates);

    return res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    logger.error(error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationErrors(validationResult.error),
      });
    }

    const { id } = validationResult.data;

    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own profile',
      });
    }
    await deleteUserService(id);

    return res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error(error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};
