import request from 'supertest';
import app from '#src/app.js';
import { db } from '#config/database.js';
import users from '#models/user.model.js';
import { eq } from 'drizzle-orm';

describe('User API', () => {
  let authToken;
  let userId;
  let adminToken;
  let adminId;

  beforeAll(async () => {
    // setup test user
    const signupResponse = await request(app).post('/api/auth/sign-up').send({
      name: 'Test User For API',
      email: 'userapi@example.com',
      password: 'password123',
      role: 'user',
    });

    const cookies = signupResponse.headers['set-cookie'];
    if (cookies && Array.isArray(cookies)) {
      authToken = cookies
        .find(cookie => cookie.startsWith('token='))
        ?.split(';')[0]
        ?.split('=')[1];
    }
    userId = signupResponse.body.user.id;

    // setup admin user
    const adminResponse = await request(app).post('/api/auth/sign-up').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    const adminCookies = adminResponse.headers['set-cookie'];
    if (adminCookies && Array.isArray(adminCookies)) {
      adminToken = adminCookies
        .find(cookie => cookie.startsWith('token='))
        ?.split(';')[0]
        ?.split('=')[1];
    }
    adminId = adminResponse.body.user.id;
  });

  afterAll(async () => {
    // cleanup
    try {
      await db.delete(users).where(eq(users.email, 'userapi@example.com'));
      await db.delete(users).where(eq(users.email, 'admin@example.com'));
      await db.delete(users).where(eq(users.email, 'another@example.com'));
    } catch (error) {
      // ignore cleanup errors
    }
  });

  describe('GET /api/users', () => {
    it('should get all users when authenticated', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('count');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/users').expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id when authenticated', async () => {
      const response = await request(app)
        .get(`/api/users/${userId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'userapi@example.com');
    });

    it('should fail with invalid user id', async () => {
      const response = await request(app)
        .get('/api/users/99999')
        .set('Cookie', [`token=${authToken}`])
        .expect(404);

      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should fail with invalid id format', async () => {
      const response = await request(app)
        .get('/api/users/invalid')
        .set('Cookie', [`token=${authToken}`])
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update own profile', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          name: 'Updated Test User',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.user).toHaveProperty('name', 'Updated Test User');
    });

    it('should fail to update another user profile as regular user', async () => {
      // create another user
      const anotherUser = await request(app).post('/api/auth/sign-up').send({
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123',
      });

      const response = await request(app)
        .put(`/api/users/${anotherUser.body.user.id}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          name: 'Hacked Name',
        })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Forbidden');
    });

    it('should allow admin to update any user', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', [`token=${adminToken}`])
        .send({
          name: 'Admin Updated Name',
        })
        .expect(200);

      expect(response.body.user).toHaveProperty('name', 'Admin Updated Name');
    }, 10000);

    it('should fail to change role as regular user', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          role: 'admin',
        })
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Forbidden');
      expect(response.body.message).toContain('Only admins can change');
    });

    it('should allow admin to change user role', async () => {
      const response = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', [`token=${adminToken}`])
        .send({
          role: 'admin',
        })
        .expect(200);

      expect(response.body.user).toHaveProperty('role', 'admin');

      // revert back to user role
      await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', [`token=${adminToken}`])
        .send({
          role: 'user',
        });
    });
  });

  describe('DELETE /api/users/:id', () => {
    let userToDelete;
    let deleteToken;

    beforeEach(async () => {
      // cleanup any existing user first
      try {
        await db.delete(users).where(eq(users.email, 'delete@example.com'));
      } catch (error) {
        // ignore
      }

      // setup user for deletion test
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send({
          name: 'User To Delete',
          email: 'delete@example.com',
          password: 'password123',
        })
        .expect(201);

      userToDelete = response.body.user;
      expect(userToDelete).toBeDefined();
      expect(userToDelete.id).toBeDefined();

      const cookies = response.headers['set-cookie'];
      if (cookies && Array.isArray(cookies)) {
        deleteToken = cookies
          .find(cookie => cookie.startsWith('token='))
          ?.split(';')[0]
          ?.split('=')[1];
      }
    });

    it('should delete own profile', async () => {
      const response = await request(app)
        .delete(`/api/users/${userToDelete.id}`)
        .set('Cookie', [`token=${deleteToken}`])
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail to delete another user as regular user', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(403);

      expect(response.body).toHaveProperty('error', 'Forbidden');
    });

    it('should allow admin to delete any user', async () => {
      // create user for admin to delete
      const userResponse = await request(app).post('/api/auth/sign-up').send({
        name: 'User To Delete By Admin',
        email: 'deletebyadmin@example.com',
        password: 'password123',
      });

      const cookies = userResponse.headers['set-cookie'];
      if (!cookies || !Array.isArray(cookies)) {
        throw new Error('Failed to get cookies from signup response');
      }

      const response = await request(app)
        .delete(`/api/users/${userResponse.body.user.id}`)
        .set('Cookie', [`token=${adminToken}`])
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});
