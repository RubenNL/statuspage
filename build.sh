#!/bin/bash
docker buildx build --push -t docker.rubend.nl/statuspage-build -f AllArch .
docker buildx create --use
docker buildx build -f EveryArch --platform linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64/v8,linux/ppc64le,linux/s390x --push --tag docker.rubend.nl/statuspage:latest .
docker buildx stop
docker buildx rm
