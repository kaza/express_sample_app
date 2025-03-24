import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

export const setupTestEnv = () => {
  const testEnvPath = path.resolve(process.cwd(), '.env.test');
  if (fs.existsSync(testEnvPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(testEnvPath));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  }
};

export const cleanupTestEnv = () => {
  // Clean up any test-specific environment variables
  delete process.env.API_SECRET;
}; 