import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import users from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashedPassword = async password => {
  const saltRounds = 10; // bcrypt default
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    logger.error(`Error hashing password: ${error}`);
    throw new Error('Error hashing password');
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }
    
    const hash_password = await hashedPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({ name, email, password: hash_password, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });
    logger.info(`New user created: ${newUser.email}`);
    return newUser;
  } catch (error) {
    logger.error(`Error while creating user: ${error}`);
    if (error.message === 'User with this email already exists') {
      throw error;
    }
    throw new Error('Error creating user');
  }
};

export const findUserByEmail = async email => {
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    logger.error(`Error finding user by email: ${email}`, error);
    throw error;
  }
};
