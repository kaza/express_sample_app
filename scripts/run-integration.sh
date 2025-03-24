#!/bin/bash
# run-integration.sh

# Start the Docker container for PostgreSQL
docker-compose up -d

# Wait for the database to become ready
echo "Waiting for the database to start..."
sleep 2
echo "Finished waiting for the database to start"

# Apply Prisma migrations
npx prisma migrate deploy

# Run integration tests with or without UI based on parameter
if [ "$#" -eq "0" ]; then
    vitest -c ./vitest.config.integration.ts
else
    vitest -c ./vitest.config.integration.ts --ui
fi

# Tear down the Docker container
docker-compose down 