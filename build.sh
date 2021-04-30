#!/bin/bash
docker build -t docker.rubend.nl/statuspage-frontend -f Frontend .
docker push docker.rubend.nl/statuspage-frontend
docker buildx create --use
docker buildx build -f Backend --platform linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64/v8,linux/ppc64le,linux/s390x --push --tag docker.rubend.nl/statuspage:latest .
docker rmi docker.rubend.nl/statuspage-frontend
