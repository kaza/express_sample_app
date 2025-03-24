import request from 'supertest';
import app from '../../src/lib/createServer';
import prisma from '../../src/lib/prisma';
import bcrypt from 'bcrypt';
//import { comparePasswords } from '../auth/auth.service';
// import { hashPassword } from     '../src/utils/auth';

describe('Authentication Endpoints', () => {
  const userData = {
    username: 'testuser',
    password: 'password123',
  };

  // Create the test user before each test (because reset-db clears the database before each test)
  beforeEach(async () => {
    try {
      const hashedPassword = bcrypt.hashSync(userData.password, 8);
      await prisma.user.create({
        data: {
          username: userData.username,
          password: hashedPassword,
        },
      });
    } catch (error) {
      console.error('Error setting up test database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
   // await prisma.$disconnect();
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
    });

    it('should return an error if username already exists', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send(userData);
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Username already taken');
    });
  });

  describe('POST /auth/signin', () => {
    it('should authenticate an existing user and return a token', async () => {
      const res = await request(app)
        .post('/auth/signin')
        .send(userData);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return an error if credentials are invalid', async () => {
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
