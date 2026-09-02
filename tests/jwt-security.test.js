import { afterEach, describe, expect, test } from '@jest/globals';
import { jwttoken } from '../src/utils/jwt.js';

const originalSecret = process.env.JWT_SECRET;

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalSecret;
  }
});

describe('JWT secret configuration', () => {
  test('refuses to sign tokens when JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;
    expect(() => jwttoken.sign({ id: 'user-1', role: 'admin' })).toThrow('JWT_SECRET');
  });
});
