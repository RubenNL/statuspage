#!/bin/bash
docker build -t docker.rubend.nl/statuspage-build -f AllArch .
docker push docker.rubend.nl/statuspage-build
docker buildx create --use
docker buildx build -f EveryArch --platform linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64/v8,linux/ppc64le,linux/s390x --push --tag docker.rubend.nl/statuspage:latest .
