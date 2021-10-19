.PHONY: help version commit-version version-tag docker-build docker-push docker-release
.DEFAULT_GOAL := help

export REPOSITORY=kilabs/cloud-engineer-challenge-calculator
export VERSION=$(shell (git describe --exact-match --tags HEAD 2> /dev/null || echo "dev-latest")  | tr -d "\n")

## General

# target: help - Display callable targets.
help:
	@egrep "^# target:" [Mm]akefile


## GIT

# target: version - Get the latest tag of the commit history.
version:
	@git describe --abbrev=0 --tags

# target: commit-version - Get the tag of the current commit.
commit-version:
	@git describe --exact-match --tags HEAD

# target: get-version-tag - Get version tag or default to 'dev-latest'
version-tag:
	@(git describe --exact-match --tags HEAD 2> /dev/null || echo "dev-latest") | tr -d "\n"

## Docker

# target: docker-build - Build docker image
docker-build:
	docker build . -t $$REPOSITORY:latest

# target: docker-push - Push docker image
docker-push:
	docker push $$REPOSITORY:latest

# target: docker-release - Build and push the docker image
docker-release: docker-build docker-push
