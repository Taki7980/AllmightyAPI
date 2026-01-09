import logger from '#config/logger.js';
import { db } from '#config/database.js';
import users from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsersService = async () => {
  try {
    return await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (error) {
    logger.error('Error getting users', error);
    throw new Error('Error fetching users');
  }
};

export const getUserByIdService = async id => {
  try {
    const result = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new Error('User not found');
    }

    return result[0];
  } catch (error) {
    logger.error(`Error getting user by id: ${id}`, error);
    if (error.message === 'User not found') {
      throw error;
    }
    throw new Error('Error fetching user by ID');
  }
};

export const updateUserService = async (id, updates) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('User not found');
    }
    const [updatedUser] = await db
      .update(users)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    logger.info(`User ${id} updated successfully`);
    return updatedUser;
  } catch (error) {
    logger.error(`Error updating user: ${id}`, error);
    if (error.message === 'User not found') {
      throw error;
    }
    throw new Error('Error updating user');
  }
};

export const deleteUserService = async id => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      throw new Error('User not found');
    }
    await db.delete(users).where(eq(users.id, id));

    logger.info(`User ${id} deleted successfully`);
    return { success: true };
  } catch (error) {
    logger.error(`Error deleting user: ${id}`, error);
    if (error.message === 'User not found') {
      throw error;
    }
    throw new Error('Error deleting user');
  }
};
