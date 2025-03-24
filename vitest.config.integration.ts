// vitest.config.integration.ts
import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import * as fs from 'fs'
import * as dotenv from 'dotenv'

// Manually load .env file
try {
  const envConfig = dotenv.parse(fs.readFileSync('.env'))
  for (const k in envConfig) {
    process.env[k] = envConfig[k]
  }
} catch (error) {
  console.error('Error loading .env file:', error)
}

// Explicitly set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/quotes"
}

export default defineConfig({
  test: {
    include: ['src/tests/**/*.test.ts', 'src/tests/*.test.ts'],
    threads: false,
    setupFiles: ['src/tests/helpers/setup.ts'],
    environment: 'node',
    globals: true,
    env: {
      DATABASE_URL: process.env.DATABASE_URL
    }
  },
  resolve: {
    alias: {
      auth: '/src/auth',
      quotes: '/src/quotes',
      lib: '/src/lib'
    }
  }
})

