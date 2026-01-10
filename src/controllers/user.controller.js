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
    logger.info('Getting all Users...');
    const allUsers = await getAllUsersService();
    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error(error);
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
    logger.info(`Getting user with ID: ${id}`);

    const user = await getUserByIdService(parseInt(id));
    res.json({
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
    const userId = parseInt(id);

    // check permissions - users can only update themselves unless admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
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

    logger.info(`Updating user with ID: ${id}`);
    const updatedUser = await updateUserService(userId, updates);

    res.json({
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
    const userId = parseInt(id);

    // users can only delete themselves unless admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own profile',
      });
    }

    logger.info(`Deleting user with ID: ${id}`);
    await deleteUserService(userId);

    res.json({
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
