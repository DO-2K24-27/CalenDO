# CalenDO API

A simple calendar events API written in Go.

## Getting Started

### Prerequisites

- Go 1.20 or higher
- PostgreSQL database

### Installing Dependencies

```bash
go mod tidy
```

### Database Setup

#### Option 1: Using Docker Compose

The easiest way to set up the database is to use the provided Docker Compose file:

```bash
# Start PostgreSQL
docker-compose up -d database
```

#### Option 2: Manual Setup

1. Create a PostgreSQL database for the application:

```bash
createdb calendo
```

2. Configure database connection in `configs/config.yaml`

### Running the API

You can run the API using the provided Makefile:

```bash
# Run the API server
make run

# Build the binary
make build

# Seed the database with sample data (optional)
make seed

# Update dependencies
make deps

# Run tests
make test
```

Or run the commands directly:

```bash
# Run the API server
go run api/main.go

# Seed the database with sample data (optional)
go run cmd/seed/main.go
```

The API will be available at `http://localhost:8080`.

## API Endpoints

### Health Check
```
GET /api/health
```

### Events

- List all events:
```
GET /api/events
```

- Create a new event:
```
POST /api/events
```

- Get a specific event:
```
GET /api/events/{uid}
```

- Update an event:
```
PUT /api/events/{uid}
```

- Delete an event:
```
DELETE /api/events/{uid}
```

## Event Schema

The event object follows this structure:

```json
{
  "uid": "string",
  "summary": "string",
  "description": "string",
  "location": "string",
  "start_time": "datetime (ISO 8601)",
  "end_time": "datetime (ISO 8601)",
  "created": "datetime (ISO 8601)",
  "last_modified": "datetime (ISO 8601)"
}
```

## Technologies

### ORM (Object-Relational Mapping)

This project uses [GORM](https://gorm.io/) - The fantastic ORM library for Go:

- Full-featured ORM
- Associations (has one, has many, belongs to, many to many)
- Hooks (before/after create/save/update/delete/find)
- Eager loading with Preload, Joins
- Transactions, Nested Transactions, Save Point, RollbackTo
- Context, Prepared Statement Mode, DryRun Mode
- Batch Insert, FindInBatches, Find/Create with Map, CRUD with SQL Expr
- SQL Builder, Subquery

For details on how GORM was implemented in this project, see [GORM_IMPLEMENTATION.md](./GORM_IMPLEMENTATION.md).

## Project Structure

```
.
├── cmd/
│   └── api/           # Application entrypoints
│       └── main.go    # API main file
├── configs/           # Configuration files
│   └── config.yaml    # Main configuration file
├── internal/          # Private application code
│   ├── handlers/      # HTTP request handlers
│   ├── middleware/    # HTTP middleware
│   └── models/        # Data models
└── go.mod             # Go module file
```
