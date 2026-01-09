import request from 'supertest';
import app from '#src/app.js';
import { db } from '#config/database.js';
import users from '#models/user.model.js';
import { eq } from 'drizzle-orm';

describe('E2E User Flow', () => {
  const testEmail = 'e2e@example.com';
  let authToken;
  let userId;

  afterAll(async () => {
    // cleanup
    try {
      await db.delete(users).where(eq(users.email, testEmail));
    } catch (error) {
      // ignore cleanup errors
    }
  });

  describe('Complete user journey', () => {
    it('should complete full user lifecycle', async () => {
      // step 1: sign up
      const signupResponse = await request(app)
        .post('/api/auth/sign-up')
        .send({
          name: 'E2E Test User',
          email: testEmail,
          password: 'password123',
          role: 'user',
        })
        .expect(201);

      expect(signupResponse.body).toHaveProperty('message', 'User registered');
      userId = signupResponse.body.user.id;

      const cookies = signupResponse.headers['set-cookie'];
      if (cookies && Array.isArray(cookies)) {
        authToken = cookies
          .find(cookie => cookie.startsWith('token='))
          ?.split(';')[0]
          ?.split('=')[1];
      }

      // step 2: access protected endpoint
      const usersResponse = await request(app)
        .get('/api/users')
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(usersResponse.body.users).toBeDefined();
      expect(Array.isArray(usersResponse.body.users)).toBe(true);

      // step 3: get own profile
      const profileResponse = await request(app)
        .get(`/api/users/${userId}`)
        .set('Cookie', [`token=${authToken}`])
        .expect(200);

      expect(profileResponse.body.user).toHaveProperty('email', testEmail);

      // step 4: update profile
      const updateResponse = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          name: 'E2E Updated User',
        })
        .expect(200);

      expect(updateResponse.body.user).toHaveProperty(
        'name',
        'E2E Updated User'
      );

      // step 5: sign out
      const signoutResponse = await request(app)
        .post('/api/auth/sign-out')
        .expect(200);

      expect(signoutResponse.body).toHaveProperty('message');

      // step 6: try accessing protected endpoint (should fail)
      await request(app).get('/api/users').expect(401);

      // step 7: sign in again
      const signinResponse = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: testEmail,
          password: 'password123',
        })
        .expect(200);

      expect(signinResponse.body).toHaveProperty('message', 'User signed in');

      const newCookies = signinResponse.headers['set-cookie'];
      let newAuthToken;
      if (newCookies && Array.isArray(newCookies)) {
        newAuthToken = newCookies
          .find(cookie => cookie.startsWith('token='))
          ?.split(';')[0]
          ?.split('=')[1];
      }

      // step 8: access protected endpoint again
      await request(app)
        .get('/api/users')
        .set('Cookie', [`token=${newAuthToken}`])
        .expect(200);

      // step 9: delete account
      await request(app)
        .delete(`/api/users/${userId}`)
        .set('Cookie', [`token=${newAuthToken}`])
        .expect(200);

      // step 10: verify user is deleted (token still valid but user doesn't exist)
      const deletedUserResponse = await request(app)
        .get(`/api/users/${userId}`)
        .set('Cookie', [`token=${newAuthToken}`])
        .expect(404);

      expect(deletedUserResponse.body).toHaveProperty('error', 'User not found');
    }, 30000);
  });

  describe('Error handling flow', () => {
    it('should handle errors gracefully throughout user journey', async () => {
      // cleanup any existing test user first
      try {
        await db.delete(users).where(eq(users.email, 'errortest@example.com'));
      } catch (error) {
        // ignore
      }

      // try signing in with non-existent user
      await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(404);

      // try accessing protected route without auth
      await request(app).get('/api/users').expect(401);

      // try getting non-existent user (no auth)
      await request(app).get('/api/users/99999').expect(401);

      // sign up
      const signupResponse = await request(app)
        .post('/api/auth/sign-up')
        .send({
          name: 'Error Test User',
          email: 'errortest@example.com',
          password: 'password123',
        })
        .expect(201);

      const cookies = signupResponse.headers['set-cookie'];
      let token;
      if (cookies && Array.isArray(cookies)) {
        token = cookies
          .find(cookie => cookie.startsWith('token='))
          ?.split(';')[0]
          ?.split('=')[1];
      }

      // try getting non-existent user (with auth)
      await request(app)
        .get('/api/users/99999')
        .set('Cookie', [`token=${token}`])
        .expect(404);

      // try updating with invalid data
      await request(app)
        .put(`/api/users/${signupResponse.body.user.id}`)
        .set('Cookie', [`token=${token}`])
        .send({
          name: 'AB', // too short
        })
        .expect(400);

      // cleanup
      await db.delete(users).where(eq(users.email, 'errortest@example.com'));
    }, 30000);
  });
});
