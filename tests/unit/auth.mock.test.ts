import request from 'supertest';
import app from '../../src/lib/createServer';
import type { PrismaClient } from '@prisma/client';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { setupTestEnv, cleanupTestEnv } from '../helpers/test-env';
import bcrypt from 'bcrypt';

// Define a type for our mocked user functions
// This creates a new type that specifies what our mocked Prisma user methods should look like
type MockPrismaUser = {
  // For each Prisma method, we create a properly typed mock function
  // jest.MockedFunction tells TypeScript this is a Jest mock with all Jest's mock methods
  // PrismaClient['user']['findFirst'] gets the original type from Prisma
  findFirst: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
};

// Mock the entire prisma module
// This needs to happen before we import prisma in our test file
vi.mock('../../src/lib/prisma', () => ({
  __esModule: true,  // Tell Jest this is an ES module
  default: {
    user: {
      // Create mock functions with proper typing for each Prisma method
      // jest.fn() creates a mock function
      // The 'as' casting ensures TypeScript knows these are Jest mocks with the correct Prisma types
      create: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

// Import the mocked prisma instance
// This must come after the jest.mock() call
import prisma from '../../src/lib/prisma';
// Cast the imported prisma to our mock type
// This tells TypeScript that our prisma object has the mocked user methods
const mockedPrisma = prisma as unknown as { user: MockPrismaUser };

describe('Authentication Endpoints (Mocked)', () => {
  // Before each test, clear all mock data and implementations
  beforeEach(() => {
    vi.clearAllMocks();
    setupTestEnv();
  });

  // After all tests complete, reset all mocks to their original state
  afterAll(() => {
    vi.resetAllMocks();
    cleanupTestEnv();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return a token', async () => {
      // Mock the findFirst method to return null
      // This simulates that the username doesn't exist yet
      mockedPrisma.user.findFirst.mockResolvedValue(null);
      
      // Mock the create method to return a fake user
      // This simulates successfully creating a new user
      mockedPrisma.user.create.mockResolvedValue({
        id: 1,
        username: 'newuser',
        password: 'hashedpassword'
      });

      // Make a test HTTP request to your signup endpoint
      const res = await request(app)
        .post('/auth/signup')
        .send({
          username: 'newuser',
          password: 'newpassword',
        });

      // Verify the response is what we expect
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');

      // Verify that our Prisma methods were called correctly
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { username: 'newuser' }
      });
      expect(mockedPrisma.user.create).toHaveBeenCalled();
    });

    it('should return an error if username already exists', async () => {
      // Mock findFirst to return an existing user
      mockedPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        username: 'newuser',
        password: 'hashedpassword'
      });

      const res = await request(app)
        .post('/auth/signup')
        .send({
          username: 'newuser',
          password: 'newpassword',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Username already taken');
      
      // Verify findFirst was called with correct parameters
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { username: 'newuser' }
      });
      // Verify create was not called since user exists
      expect(mockedPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/signin', () => {
    it('should authenticate an existing user and return a token', async () => {
      // Create a real hashed password that matches 'password123'
      const hashedPassword = bcrypt.hashSync('password123', 8);
      
      // Mock findFirst to return an existing user with the real hashed password
      mockedPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        username: 'testuser',
        password: hashedPassword
      });

      const res = await request(app)
        .post('/auth/signin')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      
      // Verify findFirst was called with correct parameters
      expect(mockedPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
    });
  });
}); 