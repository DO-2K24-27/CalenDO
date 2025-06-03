# CalenDO - Calendar Management System

CalenDO is a complete calendar management system featuring a Go-based RESTful API backend and a React frontend with Kubernetes deployment capabilities.

## Project Structure

- **backend/**: Go API for event management
- **frontend/**: React-based UI for the calendar application
- **helm/**: Kubernetes deployment configuration using Helm charts

## Features

- Create, read, update, and delete calendar events
- Event details include summary, description, location, start time, and end time
- User-friendly React frontend interface
- RESTful API endpoints for event management
- API documentation with Swagger/OpenAPI
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

- The API will be available at `http://localhost:8080`
- The frontend will be available at `http://localhost:3000`

### Accessing the API

The following endpoints are available:

- Health Check: `GET /api/health`
- List all events: `GET /api/events`
- Create a new event: `POST /api/events`
- Get a specific event: `GET /api/events/{uid}`
- Update an event: `PUT /api/events/{uid}`
- Delete an event: `DELETE /api/events/{uid}`

## API Documentation

The API is documented using Swagger/OpenAPI. After running the server, you can access the Swagger UI at:

```bash
http://localhost:8080/swagger/index.html
```

The Swagger documentation files are generated and not included in version control (they're added to `.gitignore`). To generate the documentation:

```bash
# Navigate to backend directory
cd backend

# Generate Swagger documentation
make swagger
```

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

## Frontend Development

The frontend is built with React, TypeScript, and Vite.

### Prerequisites

- Node.js 18 or higher
- npm

### Quick Commands

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Kubernetes Deployment

For deploying to Kubernetes, use the provided Helm chart:

### Prerequisites

- Kubernetes cluster
- Helm 3.x installed
- Docker (for building images)

### Key Deployment Steps

   ```bash
   # Build backend and frontend images
   docker build -t calendoapi:latest ./backend
   docker build -t calendofrontend:latest ./frontend
   
   # Deploy using Helm
   helm install calendo ./helm --namespace <your-namespace> --create-namespace
   ```

The Helm chart includes:

- Backend API deployment with health checks and autoscaling capabilities
- Frontend UI deployment with Nginx serving the React application
- PostgreSQL database
- Proper ingress configuration with TLS

## License

[Add your license information here]

## Contributing

[Add contribution guidelines here]
