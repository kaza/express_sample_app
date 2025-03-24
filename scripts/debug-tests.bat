@echo off
echo === Debug Test Runner ===

echo Current directory: %CD%
echo Looking for test files...
dir /s /b src\tests\*.test.ts
echo.

echo === Running Vitest directly ===
call npx vitest -c ./vitest.config.integration.ts run --no-watch --reporter verbose
echo === Test run complete === 