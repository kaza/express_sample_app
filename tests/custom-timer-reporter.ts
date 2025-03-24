import type { Reporter, Test, Task, File } from 'vitest'

interface CustomTest extends Test {
  startTime?: number;
}

const customTimerReporter: Reporter = {
  onCollected(files: File[] | undefined) {
    if (!files) return
    
    for (const file of files) {
      for (const task of file.tasks) {
        const testTasks = (task as any).tasks || []
        for (const test of testTasks) {
          (test as CustomTest).startTime = performance.now()
        }
      }
    }
  },
  onFinished(files: File[] | undefined, errors?: unknown[]) {
    if (!files) return
    
    console.log("\n=== Test Execution Times ===")
    for (const file of files) {
      for (const task of file.tasks) {
        const testTasks = (task as any).tasks || []
        for (const test of testTasks) {
          if ((test as CustomTest).startTime) {
            const duration = (test as CustomTest).result?.duration || 
              (performance.now() - (test as CustomTest).startTime!)
            console.log(`${(test as CustomTest).name}: ${duration.toFixed(2)}ms`)
          }
        }
      }
    }
  }
}

export default customTimerReporter 