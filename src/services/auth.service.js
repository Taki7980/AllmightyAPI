import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import users from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashedPassword = async password => {
  try {
    return await bcrypt.hash(password, 10);
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
    if (existingUser.length > 0) throw new Error('User with this email already exists');
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
    logger.info(`user ${newUser.email} created successfully`);
    return newUser;
  } catch (error) {
    logger.error(`Error creating user: ${error}`);
    if (error.message === 'User with this email already exists') {
      throw error;
    }
    throw new Error('Error creating user');
  }
};

export const findUserByEmail = async email => {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0] || null;
};
