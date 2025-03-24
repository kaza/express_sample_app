import type { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from 'lib/prisma'
import { IAuthService } from './auth.interface'

export class PrismaAuthService implements IAuthService {
  constructor(private readonly prismaClient = prisma) {}

  async findUserByUsername(username: string) {
    return await this.prismaClient.user.findFirst({ where: { username } })
  }

  async createUser(user: { username: string; password: string }) {
    const hashedPassword = bcrypt.hashSync(user.password, 8)
    
    return await this.prismaClient.user.create({
      data: {
        username: user.username,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true
      }
    })
  }

  generateJWT(id: number): string {
    if (!process.env.API_SECRET) {
      throw new Error('API Secret not defined. Unable to generate JWT.')
    }
    return jwt.sign({ id }, process.env.API_SECRET, { expiresIn: 86400 })
  }

  validateJWT(token: string): number {
    if (!process.env.API_SECRET) {
      throw new Error('API Secret not defined. Unable to validate JWT.')
    }
    const payload = jwt.verify(token, process.env.API_SECRET) as { id: number }
    return payload.id
  }

  comparePasswords(input: string, encrypted: string): boolean {
    return bcrypt.compareSync(input, encrypted)
  }
}

// Create a default instance for backward compatibility
export const authService = new PrismaAuthService()
