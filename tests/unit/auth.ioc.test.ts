import request from 'supertest';
import app from '../../src/lib/createServer';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupTestEnv, cleanupTestEnv } from '../helpers/test-env';
import { MockAuthService } from '../mocks/auth.service.mock';

// Mock the auth service module first (this gets hoisted)
vi.mock('../../src/auth/auth.service', () => ({
  authService: new MockAuthService()
}));

// Import the mocked service after the mock is defined
import { authService } from '../../src/auth/auth.service';

describe('Authentication Endpoints (IoC Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupTestEnv();
    // Access the mock service through the imported authService
    (authService as any).clearUsers();
  });

  afterAll(() => {
    vi.resetAllMocks();
    cleanupTestEnv();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return a token', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          username: 'newuser',
          password: 'newpassword',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual({
        id: 1,
        username: 'newuser'
      });
    });

    it('should return an error if username already exists', async () => {
      // First create a user
      await (authService as any).createUser({
        username: 'newuser',
        password: 'newpassword'
      });

      // Try to create another user with the same username
      const res = await request(app)
        .post('/auth/signup')
        .send({
          username: 'newuser',
          password: 'newpassword',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Username already taken');
    });
  });

  describe('POST /auth/signin', () => {
    it('should authenticate an existing user and return a token', async () => {
      // Create a test user
      await (authService as any).createUser({
        username: 'testuser',
        password: 'password123'
      });

      const res = await request(app)
        .post('/auth/signin')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual({
        id: 1,
        username: 'testuser'
      });
    });

    it('should return an error if credentials are invalid', async () => {
      // Create a test user
      await (authService as any).createUser({
        username: 'testuser',
        password: 'password123'
      });

      const res = await request(app)
        .post('/auth/signin')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
}); 