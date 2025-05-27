# CalenDO API

A simple calendar events API written in Go.

## Getting Started

### Prerequisites

- Go 1.20 or higher

### Installing Dependencies

```bash
go mod tidy
```

### Running the API

```bash
go run cmd/api/main.go
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
