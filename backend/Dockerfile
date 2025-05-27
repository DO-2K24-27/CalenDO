# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o calendoapi ./api

# Final stage
FROM alpine:3.21

# Add ca certificates and create non-root user
RUN apk --no-cache add ca-certificates tzdata && \
    adduser -D -g '' appuser

WORKDIR /app

# Copy the binary from builder
COPY --from=builder /app/calendoapi .
COPY --from=builder /app/configs/config.yaml ./configs/

# Use non-root user
USER appuser

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["./calendoapi"]