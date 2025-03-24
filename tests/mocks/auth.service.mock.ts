import bcrypt from 'bcrypt';
import { IAuthService } from '../../src/auth/auth.interface';
import type { User } from '@prisma/client';

export class MockAuthService implements IAuthService {
  private users: (Omit<User, 'quotes'>)[] = [];

  async findUserByUsername(username: string): Promise<User | null> {
    return this.users.find(user => user.username === username) || null;
  }

  async createUser(user: { username: string; password: string }): Promise<{ id: number; username: string }> {
    const newUser: Omit<User, 'quotes'> = {
      id: this.users.length + 1,
      username: user.username,
      password: bcrypt.hashSync(user.password, 8)
    };
    this.users.push(newUser);
    return { id: newUser.id, username: newUser.username };
  }

  generateJWT(id: number): string {
    return `mock-jwt-${id}`;
  }

  validateJWT(token: string): number {
    const id = parseInt(token.split('-')[2]);
    return isNaN(id) ? 0 : id;
  }

  comparePasswords(input: string, encrypted: string): boolean {
    return bcrypt.compareSync(input, encrypted);
  }

  clearUsers(): void {
    this.users = [];
  }
} 