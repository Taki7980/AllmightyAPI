import request from 'supertest';
import app from '#src/app.js';
import { db } from '#config/database.js';
import users from '#models/user.model.js';
import { eq } from 'drizzle-orm';

describe('Authentication API', () => {
  afterEach(async () => {
    // cleanup test data
    try {
      await db.delete(users).where(eq(users.email, 'test@example.com'));
      await db.delete(users).where(eq(users.email, 'signin@example.com'));
    } catch (error) {
      // ignore cleanup errors
    }
  });

  describe('POST /api/auth/sign-up', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'user',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body).toHaveProperty('details');
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '12345',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should fail with short name', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });

    it('should fail with duplicate email', async () => {
      // create first user
      await request(app).post('/api/auth/sign-up').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      // try to create another with same email
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({
          name: 'Another User',
          email: 'test@example.com',
          password: 'password456',
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('POST /api/auth/sign-in', () => {
    beforeEach(async () => {
      // setup test user for signin
      await request(app).post('/api/auth/sign-up').send({
        name: 'Sign In Test',
        email: 'signin@example.com',
        password: 'password123',
      });
    });

    it('should sign in successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: 'signin@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'User signed in');
      expect(response.body.user).toHaveProperty('email', 'signin@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: 'signin@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).toHaveProperty(
        'error',
        'Invalid email or password'
      );
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('POST /api/auth/sign-out', () => {
    it('should sign out successfully', async () => {
      const response = await request(app)
        .post('/api/auth/sign-out')
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'User signed out successfully'
      );
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/token=;/);
    });
  });
});
