import { defineConfig } from 'vitest/config'
import customTimerReporter from './tests/custom-timer-reporter'

export default defineConfig({
  test: {
    include: [
      'tests/unit/**/*.test.ts',
      'tests/unit/**/*.spec.ts'
    ],
    reporters: ['verbose',customTimerReporter],
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
