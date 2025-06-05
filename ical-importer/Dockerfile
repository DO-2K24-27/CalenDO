# Build stage
FROM golang:1.24.3-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o ical-importer .

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests to iCal URLs
RUN apk --no-cache add ca-certificates tzdata

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/ical-importer .

# Copy configuration files
COPY --from=builder /app/config.yaml ./config.yaml
COPY --from=builder /app/sync-config.yaml ./sync-config.yaml

# Create logs directory
RUN mkdir -p logs && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Default command
ENTRYPOINT ["./ical-importer"]
CMD ["--help"]
