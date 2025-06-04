# CalenDO API

A simple calendar events API written in Go with support for multiple calendar plannings, allowing users to organize events into separate categories. **The API is configured as read-only**, providing only GET endpoints for data retrieval.

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

# Generate Swagger documentation
make swagger
```

Or run the commands directly:

```bash
# Run the API server
go run api/main.go

# Seed the database with sample data (optional)
go run cmd/seed/main.go
```

The API will be available at `http://localhost:8080`.

## API Documentation

The API is documented using Swagger/OpenAPI. After running the server, you can access the Swagger UI at:

```
http://localhost:8080/swagger/index.html
```

To generate or update the Swagger documentation, run:

```bash
make swagger
```

### Swagger Documentation Files

The Swagger documentation files are generated and **not** included in version control. They are added to `.gitignore` to prevent cluttering the repository with generated files. When you clone the repository, you'll need to generate the Swagger docs before running the API:

```bash
# Generate Swagger documentation
make swagger

# Then run the API
make run
```

This approach ensures that all developers work with the most up-to-date API documentation based on the current code annotations.

## API Endpoints

### Health Check
```
GET /api/health
```

### Plannings

- List all plannings with event counts:
```
GET /api/plannings
```

- Get a specific planning:
```
GET /api/plannings/{id}
```

- Get the default planning:
```
GET /api/plannings/default
```

### Events

#### Global Event Endpoints

- List all events across all plannings:
```
GET /api/events
```

- Get a specific event:
```
GET /api/events/{uid}
```

#### Planning-Specific Event Endpoints

- Get events for a specific planning:
```
GET /api/plannings/{id}/events
```

- Get a specific event from a planning:
```
GET /api/plannings/{planningId}/events/{uid}
```

**Note: This API is read-only. Create, update, and delete operations are not available.**

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
  "last_modified": "datetime (ISO 8601)",
  "planning_id": "integer",
  "planning": {
    "id": "integer",
    "name": "string",
    "description": "string",
    "color": "string",
    "is_default": "boolean"
  }
}
```

## Planning Schema

The planning object follows this structure:

```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "color": "string",
  "is_default": "boolean",
  "event_count": "integer (when included)",
  "created": "datetime (ISO 8601)",
  "updated": "datetime (ISO 8601)"
}
```

## Multiple Planning System

### Overview

The backend supports multiple calendar plannings, allowing users to organize events into separate categories with distinct database tables. This system provides:

- **Organization**: Events can be categorized into different plannings
- **Flexibility**: Each planning can have its own color and description
- **Scalability**: Database structure supports multiple planning instances
- **Backward Compatibility**: API maintains support for global event operations
- **User Experience**: Users can manage different types of events separately

### Key Features

#### Planning Management
- Unique ID for each planning
- Name, description, and color customization
- Default planning designation
- Automatic timestamps (created/updated)
- Event count calculation for plannings

#### Event-Planning Association
- Events are associated with specific plannings via `planning_id`
- Planning relationship for eager loading
- Planning-specific event filtering
- Global event operations across all plannings

### Database Schema

#### Plannings Table (`plannings`)
- `id` (primary key)
- `name`, `description`, `color`
- `is_default` (boolean)
- `created`, `updated` (timestamps)

#### Events Table (`events`)
- All existing event fields
- Added `planning_id` (foreign key to plannings.id)
- Added index on `planning_id`

### Migration Notes

When upgrading from a single calendar system:

1. Existing events will need a `planning_id` assigned
2. A default planning should be created for backward compatibility
3. The table name changes from `calendar` to `events`

### Seed Data

The system comes with sample data including:
- Default planning ("My Calendar") - set as default
- Work planning ("Work Schedule") - red color
- Personal planning ("Personal") - green color
- Sample events distributed across all three plannings

To populate the database with sample data:

```bash
make seed
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
├── api/               # Application entrypoint
│   └── main.go        # API main file
├── cmd/               # Command line tools
│   └── seed/          # Database seeding
│       └── main.go    # Seed script
├── configs/           # Configuration files
│   └── config.yaml    # Main configuration file
├── docs/              # Generated API documentation
│   ├── docs.go        # Swagger docs
│   ├── swagger.go     # Swagger config
│   ├── swagger.json   # OpenAPI spec (JSON)
│   └── swagger.yaml   # OpenAPI spec (YAML)
├── internal/          # Private application code
│   ├── database/      # Database connection
│   ├── handlers/      # HTTP request handlers
│   │   ├── handlers.go           # Event handlers
│   │   └── planning_handlers.go  # Planning handlers
│   ├── middleware/    # HTTP middleware
│   ├── models/        # Data models and DTOs
│   │   ├── event.go      # Event model
│   │   ├── event_dto.go  # Event DTOs
│   │   └── planning.go   # Planning model
│   └── repository/    # Data access layer
│       ├── event_repository.go     # Event repository
│       └── planning_repository.go  # Planning repository
├── go.mod             # Go module file
├── go.sum             # Go module checksums
├── Makefile           # Build automation
└── README.md          # This file
```

## Next Steps for Frontend Integration

1. Update API client to support planning endpoints
2. Add planning selection UI component
3. Update event creation/editing forms to include planning selection
4. Add planning management interface
5. Update calendar views to show events by planning with color coding
