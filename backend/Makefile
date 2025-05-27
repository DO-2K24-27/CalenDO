# CalenDO API Makefile

.PHONY: run build clean migrate seed test

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GORUN=$(GOCMD) run
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod

# Build parameters
BINARY_NAME=calendo
MAIN_PATH=./api

# Default target
all: build

# Build the API
build:
	$(GOBUILD) -o $(BINARY_NAME) $(MAIN_PATH)

# Run the API
run:
	$(GORUN) $(MAIN_PATH)

# Seed the database with sample data
seed:
	$(GORUN) ./cmd/seed/main.go

# Clean the binary
clean:
	$(GOCLEAN)
	rm -f $(BINARY_NAME)

# Update dependencies
deps:
	$(GOMOD) tidy

# Run tests
test:
	$(GOTEST) -v ./...

# Run the API with hot reloading (requires air)
dev:
	air -c .air.toml
