import logger from '#config/logger.js';
import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = '1d';

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  return secret;
};

export const jwttoken = {
  sign: payload => {
    try {
      return jwt.sign(payload, getJWTSecret(), {
        algorithm: 'HS256',
        expiresIn: JWT_EXPIRES_IN,
      });
    } catch (error) {
      logger.error('Failed to authenticate the token', error);
      throw error;
    }
  },
  verify: token => {
    try {
      return jwt.verify(token, getJWTSecret(), { algorithms: ['HS256'] });
    } catch (error) {
      logger.error(`Failed to authenticate the token:${error}`);
      throw error;
    }
  },
};
