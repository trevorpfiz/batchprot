#!/usr/bin/env bash
# Use this script to start a docker container for a local development database

DB_CONTAINER_NAME="batchprot-postgres"
DB_VOLUME_PATH="$(pwd)/.sst/storage/postgres"
DB_IMAGE="postgres:16.4"
DB_USER="postgres"
DB_PASSWORD="password"
DB_NAME="local"
DB_PORT="5432"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install Docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Database container '$DB_CONTAINER_NAME' already running"
  exit 0
fi

if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Starting existing database container '$DB_CONTAINER_NAME'"
  docker start "$DB_CONTAINER_NAME"
  exit 0
fi

# Create volume path if it doesn't exist
# if [ ! -d "$DB_VOLUME_PATH" ]; then
#   mkdir -p "$DB_VOLUME_PATH"
# fi

echo "Creating and starting database container '$DB_CONTAINER_NAME'..."
docker run \
  --name $DB_CONTAINER_NAME \
  --rm \
  -p "$DB_PORT":5432 \
  -v "$DB_VOLUME_PATH:/var/lib/postgresql/data" \
  -e POSTGRES_USER="$DB_USER" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB="$DB_NAME" \
  "$DB_IMAGE"

if [ $? -eq 0 ]; then
  echo "Database container '$DB_CONTAINER_NAME' created and started successfully."
else
  echo "Failed to create and start the database container."
  exit 1
fi
