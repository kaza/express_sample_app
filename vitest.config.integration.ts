// vitest.config.integration.ts
import { defineConfig } from 'vitest/config'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load test environment variables
try {
  const testEnvPath = path.resolve(process.cwd(), '.env.test');
  if (fs.existsSync(testEnvPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(testEnvPath));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  }
} catch (error) {
  console.error('Error loading .env.test file:', error);
}



export default defineConfig({
  test: {
    include: [
      'tests/integration/**/*.test.ts',
      'tests/integration/**/*.spec.ts'
    ],
    threads: false,
    setupFiles: ['tests/helpers/setup.ts'],
    environment: 'node',
    globals: true,
    reporters: ['verbose'],
    slowTestThreshold: 50,

  },
  resolve: {
    alias: {
      auth: '/src/auth',
      quotes: '/src/quotes',
      lib: '/src/lib'
    }
  }
})

