import request from 'supertest';
import app from '../lib/createServer';
import bcrypt from 'bcrypt';
import { PrismaClient, User } from '@prisma/client';

// Define a type for our mocked user functions
// This creates a new type that specifies what our mocked Prisma user methods should look like
type MockPrismaUser = {
  // For each Prisma method, we create a properly typed mock function
  // jest.MockedFunction tells TypeScript this is a Jest mock with all Jest's mock methods
  // PrismaClient['user']['findUnique'] gets the original type from Prisma
  findUnique: jest.MockedFunction<PrismaClient['user']['findUnique']>;
  create: jest.MockedFunction<PrismaClient['user']['create']>;
  deleteMany: jest.MockedFunction<PrismaClient['user']['deleteMany']>;
};

// Mock the entire prisma module
// This needs to happen before we import prisma in our test file
jest.mock('../lib/prisma', () => ({
  __esModule: true,  // Tell Jest this is an ES module
  default: {
    user: {
      // Create mock functions with proper typing for each Prisma method
      // jest.fn() creates a mock function
      // The 'as' casting ensures TypeScript knows these are Jest mocks with the correct Prisma types
      create: jest.fn() as jest.MockedFunction<PrismaClient['user']['create']>,
      findUnique: jest.fn() as jest.MockedFunction<PrismaClient['user']['findUnique']>,
      deleteMany: jest.fn() as jest.MockedFunction<PrismaClient['user']['deleteMany']>,
    },
  },
}));

// Import the mocked prisma instance
// This must come after the jest.mock() call
import prisma from '../lib/prisma';
// Cast the imported prisma to our mock type
// This tells TypeScript that our prisma object has the mocked user methods
const mockedPrisma = prisma as unknown as { user: MockPrismaUser };

describe('Authentication Endpoints (Mocked)', () => {
  // Before each test, clear all mock data and implementations
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // After all tests complete, reset all mocks to their original state
  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return a token', async () => {
      // Mock the findUnique method to return null
      // This simulates that the username doesn't exist yet
      mockedPrisma.user.findUnique.mockResolvedValue(null);
      
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
      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'newuser' }
      });
      expect(mockedPrisma.user.create).toHaveBeenCalled();
    });
  });
}); 