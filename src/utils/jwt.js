import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret key of jwt'; // TODO: change default in production
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const jwttoken = {
  sign: payload => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    } catch (error) {
      logger.error('JWT sign error:', error);
      throw new Error('Failed to sign token');
    }
  },
  verify: token => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('JWT verify error:', error);
      throw new Error('Invalid or expired token');
    }
  },
};
