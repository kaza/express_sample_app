@echo off
echo === Starting integration tests ===

REM Start the Docker container for PostgreSQL
echo Starting Docker container...
docker-compose up -d
echo Docker container started

REM Wait for the database to become ready
echo Waiting for the database to start...
timeout /t 2 /nobreak
echo Finished waiting for the database to start

REM Push schema to the database
echo Setting up database schema...
npx prisma db push --skip-generate
echo Database schema created

REM Debug output
echo === Running integration tests now... ===

REM Run integration tests with or without UI based on parameter
if "%1"=="" (
    echo Command: npx vitest -c ./vitest.config.integration.ts run --no-watch
    call npx vitest -c ./vitest.config.integration.ts run --no-watch
) else (
    echo Command: npx vitest -c ./vitest.config.integration.ts --ui
    call npx vitest -c ./vitest.config.integration.ts --ui
)

echo === Test run complete ===

REM Tear down the Docker container
echo Shutting down Docker container...
docker-compose down
echo Done 