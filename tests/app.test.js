import app from '#src/app.js';
import request from 'supertest';

describe('API endpoints', () => {
  describe('GET /health', () => {
    it('Should return health status', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api', () => {
    it('Should return API message', async () => {
      const response = await request(app).get('/api').expect(200);
      expect(response.body).toHaveProperty('message', 'allMightyAPI runnnig');
    });
  });

  describe('GET /nonexistant', () => {
    it('Should return 404 for nonexistant', async () => {
      const response = await request(app).get('/nonexistant').expect(404);
      expect(response.body).toHaveProperty('error', 'Route Not Found...');
    });
  });
});
