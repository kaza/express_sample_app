import type { User } from '@prisma/client'

export interface IAuthService {
  findUserByUsername(username: string): Promise<User | null>
  createUser(user: { username: string; password: string }): Promise<{ id: number; username: string }>
  comparePasswords(input: string, encrypted: string): boolean
  generateJWT(id: number): string
  validateJWT(token: string): number
} 