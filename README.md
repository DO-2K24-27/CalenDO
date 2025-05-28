# CalenDO - Calendar Management System

CalenDO is a complete calendar management system featuring a Go-based RESTful API backend with Kubernetes deployment capabilities.

## Project Structure

- **backend/**: Go API for event management
- **helm/**: Kubernetes deployment configuration using Helm charts

## Features

- Create, read, update, and delete calendar events
- Event details include summary, description, location, start time, and end time
- RESTful API endpoints for event management
- Kubernetes deployment support with scalable configuration
- Docker containerization for easy deployment

## Getting Started

### Development Environment

You can quickly start the development environment using Docker Compose:

```bash
# Start both the database and API
docker-compose up -d

# Or start just the database for local development
docker-compose up -d database
```

The API will be available at `http://localhost:8080`.

### Accessing the API

The following endpoints are available:

- Health Check: `GET /api/health`
- List all events: `GET /api/events`
- Create a new event: `POST /api/events`
- Get a specific event: `GET /api/events/{uid}`
- Update an event: `PUT /api/events/{uid}`
- Delete an event: `DELETE /api/events/{uid}`

## Backend Development

The backend is written in Go. For detailed instructions on running and developing the backend, see the [backend README](./backend/README.md).

### Prerequisites

- Go 1.20 or higher
- PostgreSQL database (or use the provided Docker Compose configuration)

### Quick Commands

```bash
# Navigate to backend directory
cd backend

# Run the API server
make run

# Seed the database with sample data
make seed

# Run tests
make test
```

## Kubernetes Deployment

For deploying to Kubernetes using Helm, see the [Helm README](./helm/README.md).

### Key Deployment Steps

1. Configure your values in `helm/calendoapi/values.yaml`
2. Deploy using:
   ```bash
   helm install calendoapi ./helm/calendoapi --namespace <your-namespace> --create-namespace
   ```

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
