#!/bin/bash

set -e
set -x

TAG=$1  # The tag ID pulled from dockerhub
ID=$2 # The ID from docker-compose.yaml
DOCKER_USER=$3  # Dockerhub username
DOCKER_PASSWORD=$4  # Dockerhub password

if [ -z "$TAG" ]; then
    echo "Error: No tag provided"
    exit 1
fi

if [ -z "$DOCKER_USER" ]; then
    echo "Error: DOCKER_USER environment variable not set"
    exit 1
fi

if [ -z "$DOCKER_PASSWORD" ]; then
    echo "Error: DOCKER_PASSWORD environment variable not set"
    exit 1
fi

# Login to Dockerhub
echo "Authenticating ...."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USER" --password-stdin

# Construct the image name
IMAGE="joyfulburger/opulenz:${ID}-${TAG}"

echo "Stopping and removing the existing container..."
docker stop $ID || true
docker rm -f $ID || true

echo "Removing the old image for $ID..."
docker images | grep "$ID" | awk '{print $3}' | xargs -r docker rmi -f || true

echo "Pulling the latest image for $ID with tag: $TAG"
docker pull $IMAGE

echo "Tagging the pulled image as $ID (latest)..."
docker tag $IMAGE $ID:latest

echo "Starting the new container with the updated image"
docker run --file .env -d $ID

# Clean up unnecessary tags
echo "Cleaning up unused tags..."
docker rmi -f $IMAGE || true

echo "Deployment successful!"
